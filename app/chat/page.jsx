"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import useAuth from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";

export default function ChatList() {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchChats = async () => {
            // 1. Fetch chats where user is participant
            const { data: chatData, error } = await supabase
                .from('chats')
                .select('*')
                .contains('participants', [user.id])
                .order('updated_at', { ascending: false });

            if (error) {
                console.error("Error fetching chats:", error);
                setLoading(false);
                return;
            }

            if (!chatData) {
                setChats([]);
                setLoading(false);
                return;
            }

            // 2. Fetch details for the "other" user in each chat
            const chatsWithDetails = await Promise.all(chatData.map(async (chat) => {
                const otherId = chat.participants.find(id => id !== user.id);
                let otherUser = { name: "Unknown", photo_url: null };

                if (otherId) {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('name, photo_url, email')
                        .eq('id', otherId)
                        .single();

                    if (userData) otherUser = userData;
                }

                return {
                    ...chat,
                    otherUser
                };
            }));

            setChats(chatsWithDetails);
            setLoading(false);
        };

        fetchChats();

        // Subscribe to chat list updates
        const subscription = supabase
            .channel('chat-list')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'chats' }, // Naive subscription, filters in UI would be better but RLS handles security
                () => fetchChats() // Refetch on any change for simplicity
            )
            .subscribe();

        return () => subscription.unsubscribe();
    }, [user]);

    if (loading) return (
        <main className="max-w-2xl mx-auto p-4 md:p-6 min-h-screen">
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>)}
            </div>
        </main>
    );

    return (
        <main className="max-w-2xl mx-auto p-4 md:p-6 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Messages</h1>
            </div>

            {chats.length === 0 ? (
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
                            <Avatar src={chat.otherUser?.photo_url} size={56} />

                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {chat.otherUser?.name || chat.otherUser?.email?.split('@')[0] || "User"}
                                    </h3>
                                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                        {chat.updated_at
                                            ? formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })
                                            : ""}
                                    </span>
                                </div>
                                <p className="text-sm truncate text-gray-900 dark:text-gray-300">
                                    {chat.last_message || "Sent an attachment"}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
