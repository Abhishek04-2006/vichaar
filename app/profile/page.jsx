"use client";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { db, storage } from "@/app/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfilePage() {
  const user = useAuth();

  const [loading, setLoading] = useState(true);
  const [myPosts, setMyPosts] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);

  // Avatar
  const [uploading, setUploading] = useState(false);

  // ✅ Load user posts from Firestore
  useEffect(() => {
    if (!user) return;

    const fetchUserPosts = async () => {
      try {
        const q = query(collection(db, "posts"), where("authorId", "==", user.uid));
        const snapshot = await getDocs(q);

        const loadedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMyPosts(loadedPosts);

        // Count likes
        let likeCount = 0;
        loadedPosts.forEach((p) => {
          likeCount += p.likes || 0;
        });
        setTotalLikes(likeCount);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }

      setLoading(false);
    };

    fetchUserPosts();
  }, [user]);

  // ✅ Upload profile picture
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const avatarRef = ref(storage, `avatars/${user.uid}.jpg`);
      await uploadBytes(avatarRef, file);

      const url = await getDownloadURL(avatarRef);

      // Update localStorage (temporary)
      const updatedUser = { ...user, photoURL: url };
      localStorage.setItem("vichaar_user", JSON.stringify(updatedUser));

      alert("Profile picture updated! Refresh to see changes.");

    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    }

    setUploading(false);
  };

  if (!user) return <p className="text-center mt-10">Loading user...</p>;
  if (loading) return <p className="text-center mt-10">Loading your posts...</p>;

  return (
    <main className="max-w-2xl mx-auto p-6 min-h-screen bg-gray-100 dark:bg-gray-900">

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow flex flex-col items-center">

        {/* Avatar */}
        <div className="relative">
          <img
            src={
              user.photoURL ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
            alt="Avatar"
          />

          <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-md cursor-pointer">
            📸
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </label>
        </div>

        <h1 className="text-xl font-bold mt-3 text-gray-800 dark:text-gray-100">
          {user.email}
        </h1>

        <div className="flex gap-4 mt-4">
          <div className="px-4 py-2 bg-blue-200 dark:bg-blue-900 rounded-lg">
            {myPosts.length} Posts
          </div>
          <div className="px-4 py-2 bg-pink-200 dark:bg-pink-900 rounded-lg">
            {totalLikes} Likes
          </div>
        </div>

      </div>

      {/* User Posts */}
      <h2 className="mt-6 mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Your Posts
      </h2>

      {myPosts.length === 0 ? (
        <p className="text-gray-500">You have not posted anything yet.</p>
      ) : (
        <div className="space-y-4">
          {myPosts.map((p) => (
            <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
              <h3 className="font-semibold text-lg">{p.content}</h3>
              <p className="text-sm text-gray-500">{p.date}</p>
              <p className="text-sm mt-2">❤️ {p.likes} likes</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
