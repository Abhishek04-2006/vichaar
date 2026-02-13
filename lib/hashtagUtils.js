/**
 * Hashtag Utility Functions
 * Handles hashtag extraction, rendering, and management
 */

/**
 * Extract hashtags from text
 * @param {string} text - The text to extract hashtags from
 * @returns {string[]} - Array of unique hashtags (without #)
 */
export function extractHashtags(text) {
    if (!text) return [];

    // Match hashtags: # followed by alphanumeric characters (including unicode for Hindi/regional languages)
    const hashtagRegex = /#([\p{L}\p{N}_]+)/gu;
    const matches = text.matchAll(hashtagRegex);

    // Extract unique hashtags and convert to lowercase
    const hashtags = [...new Set(
        Array.from(matches).map(match => match[1].toLowerCase())
    )];

    return hashtags;
}

/**
 * Render text with clickable hashtags
 * @param {string} text - The text to render
 * @returns {React.ReactNode[]} - Array of text and hashtag components
 */
export function renderTextWithHashtags(text) {
    if (!text) return [];

    const parts = [];
    let lastIndex = 0;

    // Match hashtags in the text
    const hashtagRegex = /#([\p{L}\p{N}_]+)/gu;
    let match;

    while ((match = hashtagRegex.exec(text)) !== null) {
        // Add text before hashtag
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex, match.index)
            });
        }

        // Add hashtag
        parts.push({
            type: 'hashtag',
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
 * Get trending hashtags from Supabase
 * @param {object} supabase - Supabase client
 * @param {number} limit - Number of hashtags to fetch
 * @returns {Promise<Array>} - Array of trending hashtags
 */
export async function getTrendingHashtags(supabase, limit = 10) {
    try {
        const { data, error } = await supabase
            .from('hashtags')
            .select('*')
            .order('post_count', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching trending hashtags:', error);
        return [];
    }
}

/**
 * Get recent hashtags (recently used)
 * @param {object} supabase - Supabase client
 * @param {number} limit - Number of hashtags to fetch
 * @returns {Promise<Array>} - Array of recent hashtags
 */
export async function getRecentHashtags(supabase, limit = 10) {
    try {
        const { data, error } = await supabase
            .from('hashtags')
            .select('*')
            .order('last_used', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching recent hashtags:', error);
        return [];
    }
}

/**
 * Search hashtags by query
 * @param {object} supabase - Supabase client
 * @param {string} query - Search query
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} - Array of matching hashtags
 */
export async function searchHashtags(supabase, query, limit = 20) {
    if (!query) return [];

    try {
        const { data, error } = await supabase
            .from('hashtags')
            .select('*')
            .ilike('tag', `%${query.toLowerCase()}%`)
            .order('post_count', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error searching hashtags:', error);
        return [];
    }
}

/**
 * Get posts by hashtag
 * @param {object} supabase - Supabase client
 * @param {string} hashtag - Hashtag to search for (without #)
 * @param {number} limit - Number of posts to fetch
 * @returns {Promise<Array>} - Array of posts
 */
export async function getPostsByHashtag(supabase, hashtag, limit = 50) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .contains('hashtags', [hashtag.toLowerCase()])
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching posts by hashtag:', error);
        return [];
    }
}

/**
 * Format hashtag for display
 * @param {string} tag - Hashtag (with or without #)
 * @returns {string} - Formatted hashtag with #
 */
export function formatHashtag(tag) {
    if (!tag) return '';
    return tag.startsWith('#') ? tag : `#${tag}`;
}

/**
 * Validate hashtag
 * @param {string} tag - Hashtag to validate
 * @returns {boolean} - Whether hashtag is valid
 */
export function isValidHashtag(tag) {
    if (!tag) return false;

    // Remove # if present
    const cleanTag = tag.replace(/^#/, '');

    // Must be 1-50 characters, alphanumeric + underscore
    const validRegex = /^[\p{L}\p{N}_]{1,50}$/u;
    return validRegex.test(cleanTag);
}

/**
 * Get hashtag color based on popularity
 * @param {number} postCount - Number of posts with this hashtag
 * @returns {string} - Tailwind color class
 */
export function getHashtagColor(postCount) {
    if (postCount >= 100) return 'text-red-500';
    if (postCount >= 50) return 'text-orange-500';
    if (postCount >= 20) return 'text-yellow-500';
    if (postCount >= 10) return 'text-green-500';
    return 'text-blue-500';
}
