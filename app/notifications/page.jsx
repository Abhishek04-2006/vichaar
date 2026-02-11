"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import useAuth from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, UserPlus } from "lucide-react";

export default function NotificationsPage() {
    const user = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        const q = query(
            collection(db, "users", user.uid, "notifications"),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setNotifications(list);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    if (!user) return <div className="p-10 text-center">Please login to view notifications.</div>;

    return (
        <main className="max-w-2xl mx-auto p-4 md:p-6 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Notifications</h1>

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>)}
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p>No notifications yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition hover:bg-gray-50 dark:hover:bg-gray-750"
                        >
                            {/* Icon based on type */}
                            <div className="flex-shrink-0">
                                {notif.type === "like" && <div className="p-2 bg-red-100 text-red-500 rounded-full"><Heart size={20} fill="currentColor" /></div>}
                                {notif.type === "comment" && <div className="p-2 bg-blue-100 text-blue-500 rounded-full"><MessageCircle size={20} fill="currentColor" /></div>}
                                {notif.type === "follow" && <div className="p-2 bg-green-100 text-green-500 rounded-full"><UserPlus size={20} /></div>}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Link href={`/profile/${notif.senderId}`}>
                                        <Avatar src={notif.senderPhoto} size={32} />
                                    </Link>
                                    <p className="text-sm text-gray-800 dark:text-gray-200">
                                        <span className="font-bold">{notif.senderName}</span>
                                        {" "}
                                        {notif.type === "like" && "liked your post"}
                                        {notif.type === "comment" && "commented on your post"}
                                        {notif.type === "follow" && "started following you"}
                                    </p>
                                </div>
                                {notif.message && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 italic">&quot;{notif.message}&quot;</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    {notif.createdAt?.seconds
                                        ? formatDistanceToNow(new Date(notif.createdAt.seconds * 1000), { addSuffix: true })
                                        : "Just now"}
                                </p>
                            </div>

                            {/* Action Link */}
                            {(notif.type === "like" || notif.type === "comment") && notif.postId && (
                                <Link href={`/post/${notif.postId}`} className="text-xs border px-3 py-1 rounded-full dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    View
                                </Link>
                            )}
                            {notif.type === "follow" && (
                                <Link href={`/profile/${notif.senderId}`} className="text-xs border px-3 py-1 rounded-full dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    Profile
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
