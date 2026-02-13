"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getUserSuggestions } from "@/lib/mentionUtils";
import Avatar from "./ui/Avatar";
import { AtSign } from "lucide-react";

/**
 * MentionAutocomplete Component
 * Shows user suggestions when typing @mention
 */
export default function MentionAutocomplete({
    text,
    cursorPosition,
    onSelect,
    className = ""
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentionQuery, setMentionQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        // Check if we're typing a mention
        const beforeCursor = text.slice(0, cursorPosition);
        const mentionMatch = beforeCursor.match(/@(\w*)$/);

        if (mentionMatch) {
            const query = mentionMatch[1];
            setMentionQuery(query);
            fetchSuggestions(query);
            setShowSuggestions(true);
            setSelectedIndex(0);
        } else {
            setShowSuggestions(false);
            setSuggestions([]);
        }
    }, [text, cursorPosition]);

    async function fetchSuggestions(query) {
        const users = await getUserSuggestions(supabase, query, 5);
        setSuggestions(users);
    }

    function handleSelect(user) {
        if (onSelect) {
            onSelect(user);
        }
        setShowSuggestions(false);
    }

    function handleKeyDown(e) {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % suggestions.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
                break;
            case 'Enter':
            case 'Tab':
                e.preventDefault();
                if (suggestions[selectedIndex]) {
                    handleSelect(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                break;
        }
    }

    // Attach keyboard handler to document
    useEffect(() => {
        if (showSuggestions) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [showSuggestions, selectedIndex, suggestions]);

    if (!showSuggestions || suggestions.length === 0) return null;

    return (
        <div
            ref={containerRef}
            className={`absolute z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-72 animate-fade-in ${className}`}
        >
            <div className="p-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <AtSign size={14} />
                    <span>Mention someone</span>
                </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
                {suggestions.map((user, index) => (
                    <button
                        key={user.id}
                        onClick={() => handleSelect(user)}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                    >
                        <Avatar src={user.photo_url} size={40} />

                        <div className="flex-1 text-left min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {user.name || user.username}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                @{user.username}
                            </div>
                        </div>

                        {index === selectedIndex && (
                            <div className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                                Enter
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="p-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    ↑↓ Navigate • Enter to select • Esc to close
                </div>
            </div>
        </div>
    );
}
