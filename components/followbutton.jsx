"use client";
import { useState } from "react";
import { followUser, unfollowUser } from "@/lib/follow";

export default function FollowButton({ currentUid, targetUid, isFollowing }) {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(isFollowing);

  const toggleFollow = async (e) => {
    e.preventDefault(); // Prevent link navigation if inside a link
    if (loading) return;
    setLoading(true);

    try {
      if (following) {
        await unfollowUser(currentUid, targetUid);
        setFollowing(false);
      } else {
        await followUser(currentUid, targetUid);
        setFollowing(true);
      }
    } catch (err) {
      console.error("Follow action failed:", err);
      alert("Action failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${following
        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600"
        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"
        } ${loading ? "opacity-70 cursor-wait" : ""}`}
    >
      {loading ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}
