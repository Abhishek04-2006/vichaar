"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { analyzeContent } from "@/lib/moderation";
import { extractHashtags } from "@/lib/hashtagUtils";
import { extractMentions, notifyMentionedUsers } from "@/lib/mentionUtils";
import MentionAutocomplete from "@/components/MentionAutocomplete";

export default function Publish() {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("Please write something before publishing!");
      return;
    }

    if (!user) {
      alert("You must be logged in to publish.");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // 1. Fetch latest user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError || !userData) throw new Error("User verification failed");

      // 2. Content moderation
      const isAbusive = analyzeContent(content);

      if (isAbusive) {
        alert("⚠️ Content Warning: Your post contains inappropriate language. Please keep Vichaar a safe space.");
        setLoading(false);
        return;
      }

      // 3. Extract Hashtags and Mentions
      const hashtags = extractHashtags(content);
      const mentions = extractMentions(content);

      // 4. Upload File (if any)
      let mediaUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success) throw new Error(uploadData.message || "Upload failed");
        mediaUrl = uploadData.url;
      }

      // 5. Insert Post
      const { data: newPost, error: insertError } = await supabase
        .from('posts')
        .insert({
          content: content,
          author_id: user.id,
          author_name: userData.name || user.email?.split("@")[0] || "Anonymous",
          author_email: user.email,
          author_photo: userData.photo_url || user.user_metadata?.avatar_url || null,
          hashtags: hashtags,
          mentions: mentions,
          image: mediaUrl, // Save media URL (image or video)
          likes: [],
          bookmarks: [],
          comment_count: 0
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 5. Notify mentioned users
      if (mentions.length > 0 && newPost) {
        await notifyMentionedUsers(supabase, newPost.id, mentions, user, 'post');
      }

      alert("Post published successfully!");
      setContent("");
      router.push("/feed");

    } catch (err) {
      console.error("Error publishing post:", err);
      alert("Failed to publish post: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e) => {
    setContent(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleMentionSelect = (user) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const beforeCursor = content.slice(0, cursorPosition);
    const afterCursor = content.slice(cursorPosition);

    // Find the @ symbol before cursor
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    if (!mentionMatch) return;

    const mentionStart = cursorPosition - mentionMatch[0].length;
    const newContent =
      content.slice(0, mentionStart) +
      `@${user.username} ` +
      afterCursor;

    setContent(newContent);

    // Set cursor position after the mention
    setTimeout(() => {
      const newPosition = mentionStart + user.username.length + 2;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
      setCursorPosition(newPosition);

    }, 0);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      alert("File is too large (max 10MB)");
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Share Your Thoughts
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm">
          Use #hashtags and @mentions to connect with others
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              placeholder="What's on your mind? Try using #hashtags and @mentions..."
              rows="8"
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-lg"
              value={content}
              onChange={handleTextChange}
              onKeyUp={(e) => setCursorPosition(e.target.selectionStart)}
              onClick={(e) => setCursorPosition(e.target.selectionStart)}
              required
            />

            {/* Mention Autocomplete */}
            <div className="absolute top-full left-0 mt-2 w-full">
              <MentionAutocomplete
                text={content}
                cursorPosition={cursorPosition}
                onSelect={handleMentionSelect}
              />
            </div>
          </div>

          {/* Media Upload & Preview */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200 transition text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                Add Image/Video
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />
            </div>

            {preview && (
              <div className="relative rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full z-10 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
                {file?.type.startsWith('video/') ? (
                  <video src={preview} controls className="w-full max-h-96 object-contain" />
                ) : (
                  <img src={preview} alt="Preview" className="w-full max-h-96 object-contain" />
                )}
              </div>
            )}
          </div>

          {/* Character count and tips */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-500 dark:text-gray-400">
              {content.length} characters
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="text-blue-500">#</span> Hashtags
              </span>
              <span className="flex items-center gap-1">
                <span className="text-blue-500">@</span> Mentions
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl transition-all font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Publishing...
              </span>
            ) : (
              "Publish Post"
            )}
          </button>
        </form>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">💡 Pro Tips:</h3>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Type <span className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">@username</span> to mention someone</li>
            <li>• Use <span className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">#hashtag</span> to categorize your post</li>
            <li>• Mentioned users will receive notifications</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
