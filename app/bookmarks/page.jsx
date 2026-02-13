"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import useAuth from "@/hooks/useAuth";
import Postcard from "@/components/Postcard";
import { Bookmark } from "lucide-react";
import Link from "next/link";

export default function BookmarksPage() {
    const { user } = useAuth();
    const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const fetchBookmarks = async () => {
            const { data, error } = await supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', user.id)
                .order('saved_at', { ascending: false });

            if (error) {
                console.error("Error fetching bookmarks:", error);
            } else {
                // Map the stored post_data back to a format Postcard expects
                // We also need to add the real post ID
                const posts = data.map(b => ({
                    id: b.post_id,
                    ...b.post_data,
                    // Ensure these fields exist if schema changed
                    likes: [], // We might not have latest likes count here unless we join, but for bookmarks view it's acceptable or we can fetch fresh
                    bookmarks: [user.id] // Mark as bookmarked for UI
                }));
                setBookmarkedPosts(posts);
            }
            setLoading(false);
        };

        fetchBookmarks();
    }, [user]);

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center min-h-screen flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg w-full">
                    <Bookmark size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                        Login Required
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Please login to view your bookmarked posts
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
        <main className="max-w-2xl mx-auto p-4 md:p-8 min-h-screen pb-20">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Bookmark size={32} className="text-blue-600 dark:text-blue-400" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Saved Posts
                    </h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                    Your collection of bookmarked posts (Snapshots)
                </p>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            ) : bookmarkedPosts.length === 0 ? (
                /* Empty State */
                <div className="text-center py-20">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700">
                        <Bookmark
                            size={64}
                            className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
                        />
                        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                            No Saved Posts Yet
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Start bookmarking posts you want to read later!
                        </p>
                        <Link
                            href="/feed"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition"
                        >
                            Explore Feed
                        </Link>
                    </div>
                </div>
            ) : (
                /* Bookmarked Posts */
                <div className="space-y-4">
                    {bookmarkedPosts.map((post) => (
                        <Postcard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </main>
    );
}
