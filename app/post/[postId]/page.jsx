"use client";

import { useEffect, useState, use } from "react";
import { db } from "@/app/firebase/firebaseConfig";
import {
    doc,
    getDoc,
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy,
    updateDoc,
    increment
} from "firebase/firestore";
import useAuth from "@/hooks/useAuth";
import Postcard from "@/components/Postcard";
import Avatar from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

export default function PostPage({ params }) {
    // unwrapping params for Next.js 15/16+
    const { postId } = use(params);

    const user = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // 1. Fetch Post Data
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "posts", postId), (docSnap) => {
            if (docSnap.exists()) {
                setPost({ id: docSnap.id, ...docSnap.data() });
            } else {
                setPost(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, [postId]);

    // 2. Fetch Comments (Realtime)
    useEffect(() => {
        const q = query(
            collection(db, "posts", postId, "comments"),
            orderBy("createdAt", "asc") // Oldest first like a thread
        );

        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setComments(list);
        });
        return () => unsub();
    }, [postId]);

    // 3. Handle Add Comment
    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) return alert("Please login to comment.");

        setSubmitting(true);
        try {
            // 3a. Security & Moderation Check
            // Fetch latest user status (don't trust local storage for bans)
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) throw new Error("User not found");
            const userData = userSnap.data();

            if (userData.isBanned) {
                alert("⛔ Your account has been disabled due to repeated community guideline violations.");
                setSubmitting(false);
                return;
            }

            // Check for absurd/abusive language
            const { analyzeContent } = await import("@/lib/moderation");
            const isAbusive = analyzeContent(newComment);

            if (isAbusive) {
                const currentWarnings = userData.warnings || 0;
                const newWarnings = currentWarnings + 1;

                if (newWarnings >= 2) {
                    // Second strike -> BAN
                    await updateDoc(userRef, {
                        warnings: newWarnings,
                        isBanned: true
                    });
                    alert("⛔ Account Disabled.\n\nYou have violated the community guidelines twice using abusive language. Your account is now permanentally disabled.");
                } else {
                    // First strike -> WARNING
                    await updateDoc(userRef, {
                        warnings: newWarnings
                    });
                    alert("⚠️ Warning (1/2)\n\nOur AI system detected abusive language in your comment.\nThis is your first warning. One more violation will result in an account ban.");
                }

                setSubmitting(false);
                return; // Stop execution
            }

            // 3b. Add to subcollection if safe
            await addDoc(collection(db, "posts", postId, "comments"), {
                text: newComment,
                authorId: user.uid,
                authorName: user.name || user.email?.split("@")[0] || "User",
                authorPhoto: user.photoURL || null,
                createdAt: serverTimestamp(),
            });

            // Update comment count on main post (optional but good for UX)
            await updateDoc(doc(db, "posts", postId), {
                commentCount: increment(1)
            });

            // NOTIFICATION TRIGGER
            if (post && post.authorId !== user.uid) {
                try {
                    await addDoc(collection(db, "users", post.authorId, "notifications"), {
                        type: "comment",
                        senderId: user.uid,
                        senderName: user.name || user.email?.split("@")[0] || "User",
                        senderPhoto: user.photoURL || null,
                        postId: postId,
                        message: newComment,
                        createdAt: serverTimestamp(),
                        read: false
                    });
                } catch (err) {
                    console.error("Failed to send notification", err);
                }
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
                            <Link href={`/profile/${comment.authorId}`}>
                                <Avatar src={comment.authorPhoto} size={40} />
                            </Link>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none w-full">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                        {comment.authorName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {comment.createdAt?.seconds
                                            ? formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true })
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
                        <Avatar src={user?.photoURL} size={40} className="hidden sm:block" />
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
