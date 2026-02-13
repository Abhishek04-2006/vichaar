"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getTrendingHashtags } from "@/lib/hashtagUtils";
import HashtagLink from "./HashtagLink";
import { TrendingUp, Hash } from "lucide-react";

/**
 * TrendingHashtags Component
 * Displays trending hashtags in a sidebar
 */
export default function TrendingHashtags({ limit = 10, showCount = true }) {
    const [hashtags, setHashtags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrendingHashtags();

        // Subscribe to hashtag changes
        const subscription = supabase
            .channel('trending-hashtags')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'hashtags'
            }, () => {
                fetchTrendingHashtags();
            })
            .subscribe();

        return () => subscription.unsubscribe();
    }, [limit]);

    async function fetchTrendingHashtags() {
        setLoading(true);
        const data = await getTrendingHashtags(supabase, limit);
        setHashtags(data);
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-blue-500" size={20} />
                    <h3 className="font-bold text-lg">Trending Hashtags</h3>
                </div>
                <div className="space-y-3 animate-pulse">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (hashtags.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-blue-500" size={20} />
                    <h3 className="font-bold text-lg">Trending Hashtags</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No trending hashtags yet. Be the first to start a trend!
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-blue-500" size={20} />
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    Trending Hashtags
                </h3>
            </div>

            <div className="space-y-3">
                {hashtags.map((hashtag, index) => (
                    <div
                        key={hashtag.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                <HashtagLink
                                    tag={hashtag.tag}
                                    className="text-base font-semibold truncate block"
                                />
                                {showCount && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {hashtag.post_count} {hashtag.post_count === 1 ? 'post' : 'posts'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Hash
                            size={16}
                            className="text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors flex-shrink-0"
                        />
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Click any hashtag to explore posts
                </p>
            </div>
        </div>
    );
}
