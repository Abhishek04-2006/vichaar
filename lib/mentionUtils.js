/**
 * Mention Utility Functions
 * Handles @mention extraction, rendering, and user suggestions
 */

/**
 * Extract mentions from text
 * @param {string} text - The text to extract mentions from
 * @returns {string[]} - Array of unique usernames (without @)
 */
export function extractMentions(text) {
    if (!text) return [];

    // Match mentions: @ followed by alphanumeric characters and underscores
    const mentionRegex = /@([\w]+)/g;
    const matches = text.matchAll(mentionRegex);

    // Extract unique mentions and convert to lowercase
    const mentions = [...new Set(
        Array.from(matches).map(match => match[1].toLowerCase())
    )];

    return mentions;
}

/**
 * Render text with clickable mentions
 * @param {string} text - The text to render
 * @returns {React.ReactNode[]} - Array of text and mention components
 */
export function renderTextWithMentions(text) {
    if (!text) return [];

    const parts = [];
    let lastIndex = 0;

    // Match mentions in the text
    const mentionRegex = /@([\w]+)/g;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
        // Add text before mention
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex, match.index)
            });
        }

        // Add mention
        parts.push({
            type: 'mention',
            content: match[1],
            fullMatch: match[0]
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push({
            type: 'text',
            content: text.slice(lastIndex)
        });
    }

    return parts;
}

/**
 * Render text with both hashtags and mentions
 * @param {string} text - The text to render
 * @returns {React.ReactNode[]} - Array of text, hashtag, and mention components
 */
export function renderTextWithHashtagsAndMentions(text) {
    if (!text) return [];

    const parts = [];
    let lastIndex = 0;

    // Combined regex for both hashtags and mentions
    const combinedRegex = /(#[\p{L}\p{N}_]+)|(@[\w]+)/gu;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex, match.index)
            });
        }

        // Determine if it's a hashtag or mention
        if (match[0].startsWith('#')) {
            parts.push({
                type: 'hashtag',
                content: match[0].slice(1),
                fullMatch: match[0]
            });
        } else if (match[0].startsWith('@')) {
            parts.push({
                type: 'mention',
                content: match[0].slice(1),
                fullMatch: match[0]
            });
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push({
            type: 'text',
            content: text.slice(lastIndex)
        });
    }

    return parts;
}

/**
 * Get user suggestions for autocomplete
 * @param {object} supabase - Supabase client
 * @param {string} query - Search query (partial username)
 * @param {number} limit - Number of suggestions
 * @returns {Promise<Array>} - Array of user suggestions
 */
export async function getUserSuggestions(supabase, query, limit = 10) {
    if (!query || query.length < 1) return [];

    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, photo_url')
            .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
            .limit(limit);

        if (error) throw error;

        // Format results with username
        return (data || []).map(user => ({
            ...user,
            username: user.email?.split('@')[0] || user.name?.toLowerCase().replace(/\s+/g, '') || 'user'
        }));
    } catch (error) {
        console.error('Error fetching user suggestions:', error);
        return [];
    }
}

/**
 * Get user by username (email prefix)
 * @param {object} supabase - Supabase client
 * @param {string} username - Username to search for
 * @returns {Promise<object|null>} - User object or null
 */
export async function getUserByUsername(supabase, username) {
    if (!username) return null;

    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .ilike('email', `${username}@%`)
            .limit(1)
            .single();

        if (error) return null;
        return data;
    } catch (error) {
        console.error('Error fetching user by username:', error);
        return null;
    }
}

/**
 * Send notifications to mentioned users
 * @param {object} supabase - Supabase client
 * @param {string} postId - ID of the post
 * @param {string[]} mentions - Array of mentioned usernames
 * @param {object} sender - Sender user object
 * @param {string} context - Context ('post' or 'comment')
 * @returns {Promise<void>}
 */
export async function notifyMentionedUsers(supabase, postId, mentions, sender, context = 'post') {
    if (!mentions || mentions.length === 0) return;

    try {
        // Get user IDs for mentioned usernames
        const { data: users } = await supabase
            .from('users')
            .select('id, email')
            .in('email', mentions.map(m => `${m}@%`));

        if (!users || users.length === 0) return;

        // Create notifications for each mentioned user
        const notifications = users
            .filter(user => user.id !== sender.id) // Don't notify self
            .map(user => ({
                user_id: user.id,
                type: 'mention',
                sender_id: sender.id,
                sender_name: sender.user_metadata?.name || sender.email?.split('@')[0] || 'User',
                sender_photo: sender.user_metadata?.avatar_url || null,
                post_id: postId,
                message: `mentioned you in a ${context}`,
                read: false
            }));

        if (notifications.length > 0) {
            await supabase.from('notifications').insert(notifications);
        }
    } catch (error) {
        console.error('Error notifying mentioned users:', error);
    }
}

/**
 * Validate mention
 * @param {string} mention - Mention to validate (with or without @)
 * @returns {boolean} - Whether mention is valid
 */
export function isValidMention(mention) {
    if (!mention) return false;

    // Remove @ if present
    const cleanMention = mention.replace(/^@/, '');

    // Must be 1-30 characters, alphanumeric + underscore
    const validRegex = /^[\w]{1,30}$/;
    return validRegex.test(cleanMention);
}

/**
 * Format mention for display
 * @param {string} mention - Mention (with or without @)
 * @returns {string} - Formatted mention with @
 */
export function formatMention(mention) {
    if (!mention) return '';
    return mention.startsWith('@') ? mention : `@${mention}`;
}

/**
 * Extract mention from cursor position in text
 * @param {string} text - Full text
 * @param {number} cursorPosition - Cursor position
 * @returns {object|null} - { mention, startIndex, endIndex } or null
 */
export function getMentionAtCursor(text, cursorPosition) {
    if (!text || cursorPosition < 0) return null;

    // Find the @ symbol before cursor
    let startIndex = cursorPosition;
    while (startIndex > 0 && text[startIndex - 1] !== '@' && text[startIndex - 1] !== ' ') {
        startIndex--;
    }

    if (startIndex === 0 || text[startIndex - 1] !== '@') {
        // Check if cursor is right after @
        if (cursorPosition > 0 && text[cursorPosition - 1] === '@') {
            startIndex = cursorPosition - 1;
        } else {
            return null;
        }
    } else {
        startIndex--; // Include the @
    }

    // Find the end of the mention
    let endIndex = cursorPosition;
    while (endIndex < text.length && /[\w]/.test(text[endIndex])) {
        endIndex++;
    }

    const mention = text.slice(startIndex + 1, endIndex); // Exclude @

    if (mention.length === 0) return null;

    return {
        mention,
        startIndex,
        endIndex
    };
}
