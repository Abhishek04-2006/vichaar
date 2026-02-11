"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import useAuth from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function ChatList() {
    const user = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load chats where user is a participant
    useEffect(() => {
        if (!user?.uid) return;

        const q = query(
            collection(db, "chats"),
            where("participants", "array-contains", user.uid)
        );

        const unsub = onSnapshot(q, async (snap) => {
            const list = await Promise.all(
                snap.docs.map(async (d) => {
                    const data = d.data();
                    // Find the "other" user
                    const otherId = data.participants.find((id) => id !== user.uid);
                    let otherUser = { name: "Unknown", photoURL: null };

                    if (otherId) {
                        // Optimization: In real app, cache this or store Basic User Info in the chat doc itself
                        // to avoid N+1 reads. For now, we fetch.
                        try {
                            const uSnap = await getDoc(doc(db, "users", otherId));
                            if (uSnap.exists()) otherUser = uSnap.data();
                        } catch (e) { console.error(e); }
                    }

                    return {
                        id: d.id,
                        ...data,
                        otherUser,
                    };
                })
            );

            // Sort by updatedAt client-side to avoid needing a composite index
            const sortedList = list.sort((a, b) => {
                const aTime = a.updatedAt?.seconds || 0;
                const bTime = b.updatedAt?.seconds || 0;
                return bTime - aTime; // desc order
            });

            setChats(sortedList);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    if (!user) return <div className="p-10 text-center">Please login to chat.</div>;

    return (
        <main className="max-w-2xl mx-auto p-4 md:p-6 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Messages</h1>
                {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm">New Message</button> */}
            </div>

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>)}
                </div>
            ) : chats.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p>No messages yet.</p>
                    <p className="text-sm">Visit a profile to start chatting!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {chats.map((chat) => (
                        <Link
                            key={chat.id}
                            href={`/chat/${chat.id}`}
                            className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700"
                        >
                            <Avatar src={chat.otherUser?.photoURL} size={56} />

                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {chat.otherUser?.name || "User"}
                                    </h3>
                                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                        {chat.updatedAt?.seconds
                                            ? formatDistanceToNow(new Date(chat.updatedAt.seconds * 1000), { addSuffix: true })
                                            : ""}
                                    </span>
                                </div>
                                <p className={`text-sm truncate ${chat.lastMessageRead ? 'text-gray-500' : 'text-gray-900 font-semibold dark:text-white'}`}>
                                    {chat.lastMessage || "Sent an image"}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
