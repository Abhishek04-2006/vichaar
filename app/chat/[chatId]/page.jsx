"use client";

import { useEffect, useState, useRef, use } from "react";
import { supabase } from "@/lib/supabase";
import useAuth from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function ChatRoom({ params }) {
    const { chatId } = use(params);
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [otherUser, setOtherUser] = useState(null);
    const dummyDiv = useRef(null);
    const [loading, setLoading] = useState(true);

    // 1. Load Chat Metadata and Other User
    useEffect(() => {
        if (!user?.id) return;

        const fetchChatInfo = async () => {
            const { data: chatData, error } = await supabase
                .from('chats')
                .select('participants')
                .eq('id', chatId)
                .single();

            if (error || !chatData) {
                console.error("Chat not found");
                return;
            }

            const otherId = chatData.participants.find(id => id !== user.id);
            if (otherId) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('name, photo_url, email')
                    .eq('id', otherId)
                    .single();

                if (userData) setOtherUser(userData);
            }
        };

        fetchChatInfo();
    }, [chatId, user]);

    // 2. Load Messages (Realtime)
    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true });

            if (error) console.error(error);
            else {
                setMessages(data || []);
                setLoading(false);
                setTimeout(() => dummyDiv.current?.scrollIntoView({ behavior: "smooth" }), 100);
            }
        };

        fetchMessages();

        const subscription = supabase
            .channel(`chat-messages-${chatId}`)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
                (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                    setTimeout(() => dummyDiv.current?.scrollIntoView({ behavior: "smooth" }), 100);
                }
            )
            .subscribe();

        return () => subscription.unsubscribe();
    }, [chatId]);

    // 3. Send Message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const text = newMessage.trim();
        setNewMessage(""); // Optimistic clear

        try {
            // Insert message
            const { error: msgError } = await supabase
                .from('messages')
                .insert({
                    chat_id: chatId,
                    sender_id: user.id,
                    text: text
                });

            if (msgError) throw msgError;

            // Update chat last message
            await supabase
                .from('chats')
                .update({
                    last_message: text,
                    updated_at: new Date().toISOString()
                })
                .eq('id', chatId);

        } catch (err) {
            console.error("Failed to send message", err);
            setNewMessage(text); // Revert on failure
            alert("Failed to send message");
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Please login to view chat</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center gap-3 z-10 border-b dark:border-gray-700">
                <Link href="/chat" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                    <ArrowLeft />
                </Link>
                {otherUser ? (
                    <div className="flex items-center gap-3">
                        <Avatar src={otherUser.photo_url} size={40} />
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white leading-tight">
                                {otherUser.name || otherUser.email?.split('@')[0] || "User"}
                            </h3>
                            <p className="text-xs text-green-500 flex items-center gap-1">
                                ● Online
                            </p>
                        </div>
                    </div>
                ) : (
                    <span className="font-bold text-gray-900 dark:text-white">Loading...</span>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${isMe
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700"
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
                        className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full disabled:opacity-50 transition shadow-md"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
