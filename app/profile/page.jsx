"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import { db } from "@/app/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Avatar from "@/components/ui/Avatar"; // keep your existing UI kit component
import classNames from "classnames";

/**
 * Premium Profile page — supports:
 * - show cover (or gradient fallback)
 * - change / delete cover (uploads to Cloudinary via /api/upload)
 * - instant UI update, Firestore update, localStorage sync
 */

export default function ProfilePage() {
  const user = useAuth(); // expected { uid, email, name?, ... }
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // Load user doc from Firestore (or from localStorage fallback)
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchUser = async () => {
      try {
        // try Firestore first
        const uRef = doc(db, "users", user.uid);
        const snap = await getDoc(uRef);
        if (snap.exists()) {
          if (!mounted) return;
          setUserDoc(snap.data());
        } else {
          // fallback: check localStorage
          const stored = localStorage.getItem("vichaar_user");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (mounted) setUserDoc(parsed);
            } catch {}
          } else {
            if (mounted) setUserDoc({ email: user.email, photoURL: null, coverURL: null, name: user.name || null, bio: "" });
          }
        }
      } catch (err) {
        console.error("Error loading user doc:", err);
        const stored = localStorage.getItem("vichaar_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (mounted) setUserDoc(parsed);
          } catch {}
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();
    return () => {
      mounted = false;
    };
  }, [user]);

  // sync localStorage helper
  const syncLocalStorage = (updatedUser) => {
    try {
      localStorage.setItem("vichaar_user", JSON.stringify(updatedUser));
    } catch (e) {
      // ignore
    }
  };

  // Generic upload helper to /api/upload
  async function uploadFileToCloudinary(file) {
    // file is a File object from input
    const form = new FormData();
    form.append("file", file);
    // optional: pass folder name
    form.append("folder", "vichaar_profiles");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error("Upload failed: " + text);
    }

    const json = await res.json();
    return json; // { success: true, url: 'https://...' }
  }

  // Cover upload handler
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const { success, url } = await uploadFileToCloudinary(file);
      if (!success) throw new Error("Upload failed");

      // Update Firestore
      if (user?.uid) {
        const uRef = doc(db, "users", user.uid);
        await updateDoc(uRef, { coverURL: url });
      }

      const updated = { ...(userDoc || {}), coverURL: url };
      setUserDoc(updated);
      syncLocalStorage(updated);
      alert("Cover updated!");
    } catch (err) {
      console.error("Cover upload error:", err);
      alert("Cover upload failed. See console.");
    } finally {
      setUploadingCover(false);
      // reset input so same file can be reselected
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

      // Update Firestore
      if (user?.uid) {
        const uRef = doc(db, "users", user.uid);
        await updateDoc(uRef, { photoURL: url });
      }

      const updated = { ...(userDoc || {}), photoURL: url };
      setUserDoc(updated);
      syncLocalStorage(updated);
      alert("Profile picture updated!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Profile picture upload failed. See console.");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // Delete cover (revert to default gradient)
  const handleDeleteCover = async () => {
    if (!confirm("Remove cover photo and revert to default?")) return;
    try {
      if (user?.uid) {
        const uRef = doc(db, "users", user.uid);
        await updateDoc(uRef, { coverURL: null });
      }
      const updated = { ...(userDoc || {}) };
      delete updated.coverURL;
      setUserDoc(updated);
      syncLocalStorage(updated);
      alert("Cover removed.");
    } catch (err) {
      console.error("Delete cover error:", err);
      alert("Failed to remove cover.");
    }
  };

  if (!user) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl text-center">
          <h2 className="text-xl font-semibold mb-2">Please login</h2>
          <p className="text-gray-600">You need to log in to view and edit your profile.</p>
        </div>
      </main>
    );
  }

  // UI values
  const name = userDoc?.name || user.name || user.email?.split?.("@")?.[0] || "Vichaar User";
  const photo = userDoc?.photoURL || user?.photoURL || "/default-avatar.png";
  const cover = userDoc?.coverURL || null;
  const bio = userDoc?.bio || "This user hasn't added a bio yet.";

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="rounded-xl shadow-xl overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        {/* Cover area */}
        <div className="relative h-56 md:h-64 bg-gradient-to-r from-sky-800 to-slate-900">
          {/* show cover image if exists, otherwise keep gradient */}
          {cover ? (
            <div className="absolute inset-0">
              <img
                src={cover}
                alt="Cover"
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.85)" }}
              />
            </div>
          ) : null}

          {/* Cover action buttons (top-right) */}
          <div className="absolute right-4 top-4 flex gap-2">
            <label className="inline-flex items-center gap-2 bg-gray-100/80 dark:bg-gray-800/80 px-3 py-2 rounded-md cursor-pointer hover:opacity-90">
              <span className="text-sm">Change Cover</span>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </label>

            <button
              onClick={handleDeleteCover}
              className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          </div>

          {/* Avatar + name */}
          <div className="absolute left-6 -bottom-12 flex items-end gap-6">
            <div className="relative">
              <Avatar src={photo} size={128} className="ring-4 ring-white dark:ring-gray-900" />
              <label className="absolute -right-1 bottom-0 bg-blue-600 text-white px-2 py-1 rounded-md cursor-pointer text-xs">
                Change
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            <div className="text-white dark:text-white pl-2">
              <h1 className="text-3xl font-extrabold leading-tight">{name}</h1>
              <p className="text-sm opacity-75">@{user.email?.split?.("@")?.[0]}</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="pt-20 pb-8 px-8 bg-white dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats */}
            <div className="flex items-center justify-between md:flex-col md:items-start">
              <div className="text-center md:text-left">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>

              <div className="text-center md:text-left">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>

              <div className="text-center md:text-left">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
            </div>

            {/* About */}
            <div className="md:col-span-2">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-gray-700 dark:text-gray-300">{bio}</p>
                {/* You can add more profile fields here (location, website, social links etc.) */}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={() => alert("Edit profile modal (implement)")}
            >
              Edit Profile
            </button>

            <button
              className="border px-4 py-2 rounded-md"
              onClick={() => alert("Premium features coming soon")}
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>

      {/* small uploading badges */}
      <div className="mt-4 space-x-3">
        {uploadingCover && <span className="text-sm text-gray-600">Uploading cover...</span>}
        {uploadingAvatar && <span className="text-sm text-gray-600">Uploading avatar...</span>}
      </div>
    </main>
  );
}
