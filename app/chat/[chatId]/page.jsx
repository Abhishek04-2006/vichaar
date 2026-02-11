"use client";

import { useEffect, useState, useRef, use } from "react";
import { db } from "@/app/firebase/firebaseConfig";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    getDoc
} from "firebase/firestore";
import useAuth from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChatRoom({ params }) {
    const { chatId } = use(params);
    const user = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [otherUser, setOtherUser] = useState(null);
    const dummyDiv = useRef(null);

    // 1. Load Chat Metadata (who are we talking to?)
    useEffect(() => {
        if (!user?.uid) return;

        const fetchChatInfo = async () => {
            const chatRef = doc(db, "chats", chatId);
            const snap = await getDoc(chatRef);
            if (snap.exists()) {
                const data = snap.data();
                const otherId = data.participants.find(p => p !== user.uid);
                if (otherId) {
                    const uSnap = await getDoc(doc(db, "users", otherId));
                    if (uSnap.exists()) setOtherUser(uSnap.data());
                }
            }
        };
        fetchChatInfo();
    }, [chatId, user]);

    // 2. Load Messages
    useEffect(() => {
        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setMessages(list);
            // scroll to bottom
            setTimeout(() => dummyDiv.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });

        return () => unsub();
    }, [chatId]);

    // 3. Send Message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            // Add message
            await addDoc(collection(db, "chats", chatId, "messages"), {
                text: newMessage,
                senderId: user.uid,
                createdAt: serverTimestamp(),
            });

            // Update chat meta
            await updateDoc(doc(db, "chats", chatId), {
                lastMessage: newMessage,
                updatedAt: serverTimestamp(),
                // readBy: [user.uid] // can handle read receipts later
            });

            setNewMessage("");
        } catch (err) {
            console.error("Failed to send", err);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center gap-3 z-10">
                <Link href="/chat" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                    <ArrowLeft />
                </Link>
                {otherUser ? (
                    <>
                        <Avatar src={otherUser.photoURL} size={40} />
                        <span className="font-bold text-gray-900 dark:text-white">{otherUser.name || "User"}</span>
                    </>
                ) : (
                    <span className="font-bold text-gray-900 dark:text-white">Chat</span>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMe
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none shadow-sm"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={dummyDiv}></div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full disabled:opacity-50 transition"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
