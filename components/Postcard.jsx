import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import useAuth from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";

export default function Postcard({ post }) {
  const user = useAuth();
  const [liked, setLiked] = useState(
    Array.isArray(post.likes) && user?.uid ? post.likes.includes(user.uid) : false
  );
  const [likeCount, setLikeCount] = useState(
    Array.isArray(post.likes) ? post.likes.length : 0
  );

  // Handle Like
  const handleLike = async () => {
    if (!user) return alert("Login to like posts!");

    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    const postRef = doc(db, "posts", post.id);
    try {
      if (newLiked) {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
        });

        // NOTIFICATION TRIGGER
        if (post.authorId && post.authorId !== user.uid) {
          try {
            // Check if notification already exists? 
            // Creating unique ID based on post+user to avoid spamming? 
            // For MVP, just addDoc.
            await addDoc(collection(db, "users", post.authorId, "notifications"), {
              type: "like",
              senderId: user.uid,
              senderName: user.name || user.email?.split("@")[0] || "User",
              senderPhoto: user.photoURL || null,
              postId: post.id,
              message: "", // no message for likes
              createdAt: serverTimestamp(),
              read: false
            });
          } catch (err) {
            console.error("Failed to notify like", err);
          }
        }

      } else {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
        });
      }
    } catch (err) {
      console.error("Error updating like:", err);
      // revert
      setLiked(!newLiked);
      setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  // Timestamp formatting
  let timeAgo = "Just now";
  if (post.createdAt?.seconds) {
    timeAgo = formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true });
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-100 dark:border-gray-700">

      {/* Header: Author Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-3">
          <Link href={`/profile/${post.authorId}`}>
            <Avatar src={post.authorPhoto} size={48} />
          </Link>
          <div>
            <Link href={`/profile/${post.authorId}`} className="font-bold text-gray-900 dark:text-gray-100 hover:underline">
              {post.authorName || "Unknown User"}
            </Link>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>@{post.authorEmail?.split("@")[0]}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-4 leading-relaxed">
        {post.content || post.text}
      </p>

      {/* Post Image */}
      {post.image && (
        <div className="mb-4 relative h-64 w-full rounded-xl overflow-hidden border dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
          <Image
            src={post.image}
            alt="Post Image"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-3 mt-2">

        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm hover:text-red-500 transition ${liked ? "text-red-500" : ""}`}
        >
          <Heart size={20} className={liked ? "fill-current" : ""} />
          <span>{likeCount > 0 ? likeCount : "Like"}</span>
        </button>

        {/* Comment */}
        <Link
          href={`/post/${post.id}`}
          className="flex items-center gap-2 text-sm hover:text-blue-500 transition"
        >
          <MessageCircle size={20} />
          <span>{post.commentCount || 0} Comments</span>
        </Link>

        {/* Share (Placeholder) */}
        <button className="flex items-center gap-2 text-sm hover:text-green-500 transition">
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
