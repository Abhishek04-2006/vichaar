"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import useAuth from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react";

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) console.error(error);
            else setNotifications(data || []);
            setLoading(false);
        };

        fetchNotifications();

        // Subscribe to real-time notifications
        const subscription = supabase
            .channel('notifications')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    setNotifications(prev => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => subscription.unsubscribe();
    }, [user]);

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center min-h-screen flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg w-full">
                    <Bell size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                        Login Required
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Please login to view your notifications
                    </p>
                    <Link
                        href="/login"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition"
                    >
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

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
                            className={`flex items-start gap-4 p-4 rounded-xl shadow-sm border transition hover:bg-gray-50 dark:hover:bg-gray-800 ${!notif.read ? "bg-blue-50 dark:bg-gray-800 border-blue-100 dark:border-gray-700" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                                }`}
                        >
                            {/* Icon based on type */}
                            <div className="flex-shrink-0 mt-1">
                                {notif.type === "like" && <div className="p-2 bg-red-100 text-red-500 rounded-full"><Heart size={16} fill="currentColor" /></div>}
                                {notif.type === "comment" && <div className="p-2 bg-blue-100 text-blue-500 rounded-full"><MessageCircle size={16} fill="currentColor" /></div>}
                                {notif.type === "follow" && <div className="p-2 bg-green-100 text-green-500 rounded-full"><UserPlus size={16} /></div>}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <Link href={`/profile/${notif.sender_id}`} className="flex items-center gap-2 group">
                                        <Avatar src={notif.sender_photo} size={32} />
                                        <span className="font-bold text-gray-900 dark:text-gray-100 hover:underline">{notif.sender_name}</span>
                                    </Link>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {notif.type === "like" && "liked your post"}
                                        {notif.type === "comment" && "commented:"}
                                        {notif.type === "follow" && "started following you"}
                                    </span>
                                </div>

                                {notif.message && (
                                    <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2 italic border-l-2 pl-2 border-gray-300 dark:border-gray-700 my-1">
                                        &quot;{notif.message}&quot;
                                    </p>
                                )}

                                <p className="text-xs text-gray-400 mt-2">
                                    {notif.created_at
                                        ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })
                                        : "Just now"}
                                </p>
                            </div>

                            {/* Action Link */}
                            {notif.post_id && (
                                <Link href={`/post/${notif.post_id}`} className="self-center text-xs border px-3 py-1 rounded-full dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                                    View
                                </Link>
                            )}
                            {(notif.type === "follow") && (
                                <Link href={`/profile/${notif.sender_id}`} className="self-center text-xs border px-3 py-1 rounded-full dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
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
