"use client";


import { useState } from "react";
import { db } from "@/app/firebase/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Image from "next/image";

export default function FeedInput({ user }) {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();

    if (data.success) {
      setImg(data.url);
    }

    setUploading(false);
  };

  const createPost = async () => {
    const createPost = async () => {
  if (!user || !user.uid) {
    alert("Please login first.");
    return;
  }

  await addDoc(collection(db, "posts"), {
    uid: user.uid,
    text,
    image: img || null,
    createdAt: serverTimestamp(),
  });

  setText("");
  setImg(null);
};

  };

  return (
    <div className="bg-[#1d2433] text-white rounded-xl p-4 max-w-2xl mx-auto shadow">
      <textarea
        className="w-full p-3 rounded-lg bg-[#2b3345] outline-none"
        placeholder="Share your thoughts..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Image Preview */}
      {img && (
        <div className="mt-3 relative">
          <Image
            src={img}
            width={500}
            height={300}
            alt="preview"
            className="rounded-xl border border-gray-700"
          />
          <button
            onClick={() => setImg(null)}
            className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-sm"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <label className="cursor-pointer bg-[#2b3345] hover:bg-[#343d50] px-3 py-2 rounded-lg">
          📷 Add Image
          <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </label>

        <button
          onClick={createPost}
          disabled={uploading}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
        >
          {uploading ? "Uploading..." : "Post"}
        </button>
      </div>
    </div>
  );
}
