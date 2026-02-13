"use client";

import Link from "next/link";
import { Hash } from "lucide-react";

/**
 * HashtagLink Component
 * Renders a clickable hashtag link
 */
export default function HashtagLink({ tag, showIcon = false, className = "" }) {
    // Clean the tag (remove # if present)
    const cleanTag = tag?.replace(/^#/, '') || '';

    if (!cleanTag) return null;

    return (
        <Link
            href={`/hashtag/${encodeURIComponent(cleanTag)}`}
            className={`inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors hover:underline ${className}`}
            onClick={(e) => e.stopPropagation()} // Prevent post click when clicking hashtag
        >
            {showIcon && <Hash size={14} />}
            #{cleanTag}
        </Link>
    );
}
