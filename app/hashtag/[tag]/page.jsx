"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPostsByHashtag, formatHashtag } from "@/lib/hashtagUtils";
import Postcard from "@/components/Postcard";
import TrendingHashtags from "@/components/TrendingHashtags";
import { Hash, ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HashtagPage() {
    const params = useParams();
    const hashtag = decodeURIComponent(params.tag || '');

    const [posts, setPosts] = useState([]);
    const [hashtagInfo, setHashtagInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!hashtag) return;

        fetchHashtagData();
        fetchPosts();

        // Subscribe to new posts with this hashtag
        const subscription = supabase
            .channel(`hashtag-${hashtag}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'posts',
                filter: `hashtags=cs.{${hashtag.toLowerCase()}}`
            }, (payload) => {
                setPosts(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => subscription.unsubscribe();
    }, [hashtag]);

    async function fetchHashtagData() {
        try {
            const { data } = await supabase
                .from('hashtags')
                .select('*')
                .eq('tag', hashtag.toLowerCase())
                .single();

            setHashtagInfo(data);
        } catch (error) {
            console.error('Error fetching hashtag info:', error);
        }
    }

    async function fetchPosts() {
        setLoading(true);
        const data = await getPostsByHashtag(supabase, hashtag);
        setPosts(data);
        setLoading(false);
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-6">

                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/feed"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Feed</span>
                    </Link>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <Hash size={32} className="text-white" />
                            </div>

                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    {formatHashtag(hashtag)}
                                </h1>

                                {hashtagInfo && (
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <TrendingUp size={16} />
                                            <span className="font-semibold">
                                                {hashtagInfo.post_count} {hashtagInfo.post_count === 1 ? 'post' : 'posts'}
                                            </span>
                                        </div>
                                        <div>
                                            Last used: {new Date(hashtagInfo.last_used).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}

                                {!hashtagInfo && !loading && (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Be the first to post with this hashtag!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Posts Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg animate-pulse">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                            </div>
                                        </div>
                                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                                <Hash size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    No posts yet
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Be the first to post with {formatHashtag(hashtag)}!
                                </p>
                                <Link
                                    href="/publish"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
                                >
                                    Create Post
                                </Link>
                            </div>
                        ) : (
                            posts.map(post => (
                                <Postcard key={post.id} post={post} />
                            ))
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <TrendingHashtags limit={10} />
                    </div>
                </div>
            </div>
        </main>
    );
}
