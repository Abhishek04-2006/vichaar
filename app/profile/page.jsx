"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Avatar from "@/components/ui/Avatar";
import Postcard from "@/components/Postcard";

export default function ProfilePage() {
  const { user } = useAuth();
  const [userDoc, setUserDoc] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // Load user doc & posts
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      // 1. Fetch User Data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userData) setUserDoc(userData);

      // 2. Fetch User Posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (postsData) setUserPosts(postsData);
    };

    fetchData();
  }, [user]);

  // Generic upload helper to /api/upload (Cloudinary)
  async function uploadFileToCloudinary(file) {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "vichaar_profiles");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) throw new Error("Upload failed");
    return await res.json(); // { success: true, url: '...' }
  }

  // Cover upload handler
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const { success, url } = await uploadFileToCloudinary(file);
      if (!success) throw new Error("Upload failed");

      // Update Supabase
      const { error } = await supabase
        .from('users')
        .update({ cover_url: url })
        .eq('id', user.id);

      if (error) throw error;

      setUserDoc(prev => ({ ...prev, cover_url: url }));
      alert("Cover updated!");
    } catch (err) {
      console.error("Cover upload error:", err);
      alert("Cover upload failed. Please try again.");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // Avatar upload handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { success, url } = await uploadFileToCloudinary(file);
      if (!success) throw new Error("Upload failed");

      // Update Supabase
      const { error } = await supabase
        .from('users')
        .update({ photo_url: url })
        .eq('id', user.id);

      if (error) throw error;

      setUserDoc(prev => ({ ...prev, photo_url: url }));
      // Update auth metadata too so it persists in session
      await supabase.auth.updateUser({ data: { avatar_url: url } });

      alert("Profile picture updated!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Profile picture upload failed.");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  if (!user) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl text-center">
          <h2 className="text-xl font-semibold mb-2">Please login</h2>
          <p className="text-gray-600">You need to log in to view profile.</p>
        </div>
      </main>
    );
  }

  const name = userDoc?.name || user.email?.split("@")[0] || "Vichaar User";
  const photo = userDoc?.photo_url || user.user_metadata?.avatar_url;
  const cover = userDoc?.cover_url || null;
  const bio = userDoc?.bio || "This user hasn't added a bio yet.";

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="rounded-xl shadow-xl overflow-hidden bg-white dark:bg-gray-900">
        {/* Cover area */}
        <div className="relative h-56 md:h-64 bg-gradient-to-r from-sky-800 to-slate-900 group">
          {cover && (
            <div className="absolute inset-0">
              <Image
                src={cover}
                alt="Cover"
                className="object-cover"
                fill
                style={{ filter: "brightness(0.85)" }}
              />
            </div>
          )}

          {/* Cover action buttons */}
          <div className="absolute right-4 top-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <label className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-gray-900 px-3 py-2 rounded-md cursor-pointer shadow-md transition-colors text-sm font-medium">
              Change Cover
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </label>
            {cover && (
              <button
                onClick={async () => {
                  if (confirm("Remove cover?")) {
                    await supabase.from('users').update({ cover_url: null }).eq('id', user.id);
                    setUserDoc(prev => ({ ...prev, cover_url: null }));
                  }
                }}
                className="bg-red-500/90 hover:bg-red-600 text-white px-3 py-2 rounded-md shadow-md transition-colors text-sm font-medium"
              >
                Remove
              </button>
            )}
          </div>

          {/* Avatar + name */}
          <div className="absolute left-6 -bottom-12 flex items-end gap-6">
            <div className="relative group/avatar">
              <Avatar src={photo} size={128} className="ring-4 ring-white dark:ring-gray-900 bg-white" />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover/avatar:opacity-100 rounded-full cursor-pointer transition-opacity">
                <span className="text-xs font-bold">CHANGE</span>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            <div className="text-white dark:text-white pl-2 pb-2 drop-shadow-md">
              <h1 className="text-3xl font-extrabold leading-tight">{name}</h1>
              <p className="text-sm opacity-90">@{user.email?.split("@")[0]}</p>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-end gap-3 mb-6">
            <button onClick={() => alert("Edit Profile Coming Soon")} className="px-4 py-2 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-medium">
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About & Stats */}
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl">
                <h3 className="text-lg font-bold mb-2">About</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{bio}</p>
              </div>

              <div className="flex justify-between px-2">
                <div className="text-center">
                  <div className="text-xl font-bold">{userPosts.length}</div>
                  <div className="text-xs text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{userDoc?.followers?.length || 0}</div>
                  <div className="text-xs text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{userDoc?.following?.length || 0}</div>
                  <div className="text-xs text-gray-500">Following</div>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-bold border-b pb-2 mb-4 dark:border-gray-800">Recent Posts</h3>
              {userPosts.length === 0 ? (
                <p className="text-gray-500 italic text-center py-10">No posts yet.</p>
              ) : (
                userPosts.map(post => <Postcard key={post.id} post={post} />)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Uploading Indicators */}
      {(uploadingCover || uploadingAvatar) && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse z-50">
          Uploading...
        </div>
      )}
    </main>
  );
}
