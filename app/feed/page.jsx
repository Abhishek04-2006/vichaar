"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/firebase/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

export default function Feed() {
  const user = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------
     🔥 REAL-TIME LISTENER (onSnapshot)
  ---------------------------------------------------- */
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const livePosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        comments: doc.data().comments || [],
      }));

      setPosts(livePosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ---------------------------------------------------
     3️⃣ ADD NEW POST
  ---------------------------------------------------- */
  const handlePost = async () => {
    if (!newPost.trim()) return alert("Write something!");

    const newEntry = {
      content: newPost,
      author: user?.email || "Unknown",
      likes: 0,
      comments: [],
      date: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "posts"), newEntry);
      setNewPost(""); // real-time listener updates instantly
    } catch (err) {
      console.error("Error posting:", err);
    }
  };

  /* ---------------------------------------------------
     4️⃣ LIKE POST
  ---------------------------------------------------- */
  const handleLike = async (postId, currentLikes) => {
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, { likes: currentLikes + 1 });
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  /* ---------------------------------------------------
     5️⃣ ADD COMMENT
  ---------------------------------------------------- */
  const handleComment = async (postId, commentsList) => {
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, { comments: commentsList });
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  /* ---------------------------------------------------
     UI RENDER
  ---------------------------------------------------- */
  if (!user)
    return <p className="text-center mt-10">Checking authentication...</p>;

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading posts...</p>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
        VICHAAR Feed 📰
      </h1>

      {/* Post Input */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
        <textarea
          rows="4"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
        ></textarea>
        <button
          onClick={handlePost}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Post
        </button>
      </div>

      {/* Posts Section */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No posts yet. Be the first to share your Vichaar ✨
        </p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            handleLike={handleLike}
            handleComment={handleComment}
            user={user}
          />
        ))
      )}
    </main>
  );
}

/* =====================================================
   POST CARD COMPONENT
===================================================== */
function PostCard({ post, handleLike, handleComment, user }) {
  const [commentText, setCommentText] = useState("");

  const formattedDate = post.date?.seconds
    ? post.date.toDate().toLocaleString()
    : post.date;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-4">
      {/* HEADER */}
      <div className="flex justify-between mb-2">
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          {post.author}
        </span>
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>

      {/* CONTENT */}
      <p className="text-gray-700 dark:text-gray-200 mb-3 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* LIKE SECTION */}
      <button
        onClick={() => handleLike(post.id, post.likes)}
        className="text-blue-600 hover:underline dark:text-blue-400"
      >
        ❤️ {post.likes} Likes
      </button>

      {/* COMMENTS SECTION */}
      <div className="mt-4 space-y-2">
        {post.comments?.map((c, index) => (
          <div
            key={index}
            className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md"
          >
            <p className="text-sm dark:text-white">
              <strong>{c.author}</strong>: {c.text}
            </p>
            <p className="text-xs text-gray-500">{c.date}</p>
          </div>
        ))}

        {/* ADD COMMENT */}
        <div className="flex mt-2">
          <input
            type="text"
            className="flex-1 p-2 border rounded-l-lg dark:bg-gray-700 dark:text-white"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-3 rounded-r-lg hover:bg-blue-700"
            onClick={() => {
              if (commentText.trim()) {
                const newComments = [
                  ...post.comments,
                  {
                    author: user.email || "Anonymous",
                    text: commentText,
                    date: new Date().toLocaleTimeString(),
                  },
                ];
                handleComment(post.id, newComments);
              }
              setCommentText("");
            }}
          >
            💬
          </button>
        </div>
      </div>
    </div>
  );
}
