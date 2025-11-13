"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { db } from "@/app/firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Publish() {
  const [content, setContent] = useState("");
  const router = useRouter();
  const user = useAuth();

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

    try {
      await addDoc(collection(db, "posts"), {
        content: content,
        author: user.email,
        authorId: user.uid,
        likes: 0,
        comments: [],
        createdAt: serverTimestamp(),
      });

      alert("Post published successfully!");
      setContent("");
      router.push("/feed");
    } catch (err) {
      console.error("Error publishing post:", err);
      alert("Failed to publish post.");
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          Publish a Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            placeholder="Write your thoughts here..."
            rows="6"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
          >
            Publish
          </button>
        </form>
      </div>
    </main>
  );
}
