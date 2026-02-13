"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import useAuth from "@/hooks/useAuth";
import Postcard from "@/components/Postcard";
import Avatar from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { analyzeContent } from "@/lib/moderation";

export default function PostPage({ params }) {
    const { postId } = use(params);
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // 1. Fetch Post Data
    useEffect(() => {
        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', postId)
                .single();

            if (error) {
                console.error("Error fetching post:", error);
                setPost(null);
            } else {
                setPost(data);
            }
            setLoading(false);
        };

        fetchPost();

        // Listen for post updates (like/comment count)
        const subscription = supabase
            .channel(`post-${postId}`)
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'posts', filter: `id=eq.${postId}` },
                (payload) => setPost(payload.new)
            )
            .subscribe();

        return () => subscription.unsubscribe();
    }, [postId]);

    // 2. Fetch Comments (Realtime)
    useEffect(() => {
        const fetchComments = async () => {
            const { data } = await supabase
                .from('comments')
                .select('*')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            setComments(data || []);
        };

        fetchComments();

        const subscription = supabase
            .channel(`comments-${postId}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setComments(prev => [...prev, payload.new]);
                    } else if (payload.eventType === 'DELETE') {
                        setComments(prev => prev.filter(c => c.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => subscription.unsubscribe();
    }, [postId]);

    // 3. Handle Add Comment
    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) return alert("Please login to comment.");

        setSubmitting(true);
        try {
            // Security Check (Moderation)
            const isAbusive = analyzeContent(newComment);
            if (isAbusive) {
                alert("⚠️ Warning: Your comment contains inappropriate language.");
                setSubmitting(false);
                return;
            }

            // Insert Comment
            const { error: commentError } = await supabase
                .from('comments')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    user_name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
                    user_photo: user.user_metadata?.avatar_url || null,
                    text: newComment
                });

            if (commentError) throw commentError;

            // Update comment count
            // Note: Triggers/Functions are better for this but for now we do client-side optimistic update or manual update
            // Ideally, we'd have a trigger on the DB side. I'll rely on fetching or separate update.
            // Let's manually update the post comment count for now to be safe

            if (post) {
                await supabase
                    .from('posts')
                    .update({ comment_count: (post.comment_count || 0) + 1 })
                    .eq('id', postId);
            }

            // Send Notification
            if (post && post.author_id !== user.id) {
                await supabase.from('notifications').insert({
                    user_id: post.author_id,
                    type: "comment",
                    sender_id: user.id,
                    sender_name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
                    sender_photo: user.user_metadata?.avatar_url || null,
                    post_id: postId,
                    message: newComment,
                    read: false
                });
            }

            setNewComment("");
        } catch (err) {
            console.error("Error sending comment:", err);
            alert("Failed to send comment");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading post...</div>;
    if (!post) return <div className="p-10 text-center">Post not found.</div>;

    return (
        <main className="max-w-2xl mx-auto p-4 md:p-6 min-h-screen pb-24">
            {/* Back Header */}
            <Link href="/feed" className="flex items-center gap-2 text-gray-500 mb-4 hover:text-blue-600 transition">
                <ArrowLeft size={20} />
                <span>Back to Feed</span>
            </Link>

            {/* Main Post */}
            <Postcard post={post} />

            {/* Divider */}
            <div className="my-6 border-b dark:border-gray-800"></div>

            {/* Comments List */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Comments ({comments.length})
                </h3>

                {comments.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No comments yet. Be the first!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <Link href={`/profile/${comment.user_id}`}>
                                <Avatar src={comment.user_photo} size={40} />
                            </Link>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none w-full">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                        {comment.user_name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {comment.created_at
                                            ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
                                            : "Just now"}
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area (Sticky Bottom) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSendComment} className="flex gap-2">
                        {/* Optional: Show user avatar if available */}
                        {user && <Avatar src={user.user_metadata?.avatar_url} size={40} className="hidden sm:block" />}
                        <input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Post your reply..."
                            className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                        />
                        <button
                            disabled={submitting || !newComment.trim()}
                            type="submit"
                            className="bg-blue-600 text-white p-2 rounded-full disabled:opacity-50 hover:bg-blue-700 transition"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
