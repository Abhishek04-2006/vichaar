"use client";

import Link from "next/link";
import { AtSign } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getUserByUsername } from "@/lib/mentionUtils";
import Avatar from "./ui/Avatar";

/**
 * MentionLink Component
 * Renders a clickable mention link with hover card
 */
export default function MentionLink({ username, showIcon = false, className = "" }) {
    const [userInfo, setUserInfo] = useState(null);
    const [showCard, setShowCard] = useState(false);
    const [loading, setLoading] = useState(false);

    // Clean the username (remove @ if present)
    const cleanUsername = username?.replace(/^@/, '') || '';

    if (!cleanUsername) return null;

    // Fetch user info on hover
    const handleMouseEnter = async () => {
        setShowCard(true);
        if (!userInfo && !loading) {
            setLoading(true);
            const user = await getUserByUsername(supabase, cleanUsername);
            setUserInfo(user);
            setLoading(false);
        }
    };

    const handleMouseLeave = () => {
        setTimeout(() => setShowCard(false), 200);
    };

    return (
        <span className="relative inline-block">
            <Link
                href={`/profile/${userInfo?.id || cleanUsername}`}
                className={`inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors hover:underline ${className}`}
                onClick={(e) => e.stopPropagation()} // Prevent post click when clicking mention
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {showIcon && <AtSign size={14} />}
                @{cleanUsername}
            </Link>

            {/* Hover Card */}
            {showCard && userInfo && (
                <div
                    className="absolute z-50 top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-64 animate-fade-in"
                    onMouseEnter={() => setShowCard(true)}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar src={userInfo.photo_url} size={48} />
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                {userInfo.name || cleanUsername}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                @{cleanUsername}
                            </div>
                        </div>
                    </div>

                    {userInfo.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                            {userInfo.bio}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {userInfo.followers?.length || 0}
                            </span> followers
                        </div>
                        <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {userInfo.following?.length || 0}
                            </span> following
                        </div>
                    </div>
                </div>
            )}
        </span>
    );
}
