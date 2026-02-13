"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { supabase } from "@/lib/supabase";
import useAuth from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import { renderTextWithHashtagsAndMentions } from "@/lib/mentionUtils";
import HashtagLink from "@/components/HashtagLink";
import MentionLink from "@/components/MentionLink";

// Reaction types with emojis
const REACTIONS = [
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "like", emoji: "👍", label: "Like" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
];

export default function Postcard({ post }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(
    Array.isArray(post.likes) && user?.id ? post.likes.includes(user.id) : false
  );
  const [likeCount, setLikeCount] = useState(
    Array.isArray(post.likes) ? post.likes.length : 0
  );
  const [bookmarked, setBookmarked] = useState(
    Array.isArray(post.bookmarks) && user?.id ? post.bookmarks.includes(user.id) : false
  );
  const [showReactions, setShowReactions] = useState(false);
  const [userReaction, setUserReaction] = useState(post.user_reactions?.[user?.id] || null);
  const [reactionCounts, setReactionCounts] = useState(post.reactions || {});
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const lastTap = useRef(0);

  // Handle Double-Tap to Like
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      if (!liked) {
        handleLike();
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 1000);
      }
    }
    lastTap.current = now;
  };

  // Handle Like
  const handleLike = async () => {
    if (!user) return alert("Login to like posts!");

    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      // Get current likes
      const { data: currentPost } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', post.id)
        .single();

      const currentLikes = currentPost?.likes || [];
      const updatedLikes = newLiked
        ? [...currentLikes, user.id]
        : currentLikes.filter(id => id !== user.id);

      // Update post
      await supabase
        .from('posts')
        .update({ likes: updatedLikes })
        .eq('id', post.id);

      // Create notification
      if (newLiked && post.author_id && post.author_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: post.author_id,
          type: 'like',
          sender_id: user.id,
          sender_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          sender_photo: user.user_metadata?.avatar_url || null,
          post_id: post.id,
          message: '',
          read: false,
        });
      }
    } catch (err) {
      console.error("Error updating like:", err);
      setLiked(!newLiked);
      setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  // Handle Reaction
  const handleReaction = async (reactionType) => {
    if (!user) return alert("Login to react!");

    const newReactionCounts = { ...reactionCounts };
    const newUserReactions = { ...(post.user_reactions || {}) };

    // Remove previous reaction
    if (userReaction) {
      newReactionCounts[userReaction] = (newReactionCounts[userReaction] || 1) - 1;
      if (newReactionCounts[userReaction] <= 0) delete newReactionCounts[userReaction];
    }

    // Add new reaction or remove if same
    if (userReaction !== reactionType) {
      newReactionCounts[reactionType] = (newReactionCounts[reactionType] || 0) + 1;
      newUserReactions[user.id] = reactionType;
      setUserReaction(reactionType);
    } else {
      delete newUserReactions[user.id];
      setUserReaction(null);
    }

    setReactionCounts(newReactionCounts);
    setShowReactions(false);

    try {
      await supabase
        .from('posts')
        .update({
          reactions: newReactionCounts,
          user_reactions: newUserReactions,
        })
        .eq('id', post.id);
    } catch (err) {
      console.error("Error updating reaction:", err);
    }
  };

  // Handle Bookmark
  const handleBookmark = async () => {
    if (!user) return alert("Login to bookmark posts!");

    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);

    try {
      if (newBookmarked) {
        // Add bookmark
        await supabase.from('bookmarks').insert({
          user_id: user.id,
          post_id: post.id,
          post_data: {
            content: post.content,
            image: post.image,
            author_id: post.author_id,
            author_name: post.author_name,
            author_photo: post.author_photo,
            created_at: post.created_at,
          },
        });

        // Update post bookmarks array
        const { data: currentPost } = await supabase
          .from('posts')
          .select('bookmarks')
          .eq('id', post.id)
          .single();

        const currentBookmarks = currentPost?.bookmarks || [];
        await supabase
          .from('posts')
          .update({ bookmarks: [...currentBookmarks, user.id] })
          .eq('id', post.id);
      } else {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);

        // Update post bookmarks array
        const { data: currentPost } = await supabase
          .from('posts')
          .select('bookmarks')
          .eq('id', post.id)
          .single();

        const currentBookmarks = currentPost?.bookmarks || [];
        await supabase
          .from('posts')
          .update({ bookmarks: currentBookmarks.filter(id => id !== user.id) })
          .eq('id', post.id);
      }
    } catch (err) {
      console.error("Error updating bookmark:", err);
      setBookmarked(!newBookmarked);
    }
  };

  // Timestamp formatting
  let timeAgo = "Just now";
  if (post.created_at) {
    timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  }

  // Calculate total reactions
  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">

      {/* Header: Author Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-3">
          <Link href={`/profile/${post.author_id}`}>
            <Avatar src={post.author_photo} size={48} />
          </Link>
          <div>
            <Link href={`/profile/${post.author_id}`} className="font-bold text-gray-900 dark:text-gray-100 hover:underline">
              {post.author_name || "Unknown User"}
            </Link>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>@{post.author_email?.split("@")[0]}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition ${bookmarked ? "text-blue-500" : "text-gray-400"
            }`}
          title={bookmarked ? "Remove bookmark" : "Bookmark post"}
        >
          <Bookmark size={20} className={bookmarked ? "fill-current" : ""} />
        </button>
      </div>

      {/* Post Content with Hashtags and Mentions */}
      <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-4 leading-relaxed">
        {renderTextWithHashtagsAndMentions(post.content).map((part, index) => {
          if (part.type === 'hashtag') {
            return <HashtagLink key={index} tag={part.content} className="font-semibold" />;
          }
          if (part.type === 'mention') {
            return <MentionLink key={index} username={part.content} className="font-semibold" />;
          }
          return <span key={index}>{part.content}</span>;
        })}
      </div>

      {/* Post Image with Double-Tap */}
      {post.image && (
        <div
          onClick={handleDoubleTap}
          className="mb-4 relative h-64 w-full rounded-xl overflow-hidden border dark:border-gray-700 bg-gray-100 dark:bg-gray-900 cursor-pointer select-none"
        >
          <Image
            src={post.image}
            alt="Post Image"
            fill
            className="object-cover"
            draggable={false}
          />

          {/* Heart Animation on Double-Tap */}
          {showHeartAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart
                size={80}
                className="text-white fill-current animate-ping opacity-80"
                style={{ animationDuration: '0.6s', animationIterationCount: '1' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Reaction Summary */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1 mb-2 text-sm">
          {Object.entries(reactionCounts).map(([type, count]) => {
            const reaction = REACTIONS.find(r => r.type === type);
            return count > 0 && reaction ? (
              <span key={type} className="flex items-center gap-1">
                <span>{reaction.emoji}</span>
                <span className="text-gray-500 dark:text-gray-400">{count}</span>
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-3 mt-2">

        {/* Like with Reactions */}
        <div className="relative">
          <button
            onClick={handleLike}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 200)}
            className={`flex items-center gap-2 text-sm hover:text-red-500 transition ${liked ? "text-red-500" : ""}`}
          >
            <Heart size={20} className={liked ? "fill-current" : ""} />
            <span>{likeCount > 0 ? likeCount : "Like"}</span>
          </button>

          {/* Reaction Picker */}
          {showReactions && (
            <div
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
              className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-700 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 px-2 py-2 flex gap-1 z-10 animate-bounce-in"
            >
              {REACTIONS.map((reaction) => (
                <button
                  key={reaction.type}
                  onClick={() => handleReaction(reaction.type)}
                  className={`text-2xl hover:scale-125 transition-transform duration-200 p-1 rounded-full ${userReaction === reaction.type ? "bg-blue-100 dark:bg-blue-900" : ""
                    }`}
                  title={reaction.label}
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment */}
        <Link
          href={`/post/${post.id}`}
          className="flex items-center gap-2 text-sm hover:text-blue-500 transition"
        >
          <MessageCircle size={20} />
          <span>{post.comment_count || 0}</span>
        </Link>

        {/* Share */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Post by ${post.author_name}`,
                text: post.content,
                url: window.location.origin + `/post/${post.id}`
              }).catch(() => { });
            } else {
              navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
              alert("Link copied to clipboard!");
            }
          }}
          className="flex items-center gap-2 text-sm hover:text-green-500 transition"
        >
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
