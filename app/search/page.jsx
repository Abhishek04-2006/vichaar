"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

export default function SearchPage() {
  const [term, setTerm] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // realtime load all posts (small optimization: only latest 200)
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllPosts(list);
    });
    return () => unsub();
  }, []);

  // search users with prefix match on email or name
  useEffect(() => {
    if (!term) {
      setUserResults([]);
      setPostResults([]);
      return;
    }

    const runSearch = async () => {
      setLoadingUsers(true);
      try {
        const qEmail = query(
          collection(db, "users"),
          where("email", ">=", term),
          where("email", "<=", term + "\uf8ff")
        );
        // try name too: you might have displayName field
        const qName = query(
          collection(db, "users"),
          where("name", ">=", term),
          where("name", "<=", term + "\uf8ff")
        );

        const [snapE, snapN] = await Promise.all([getDocs(qEmail), getDocs(qName)]);
        const results = [
          ...snapE.docs.map((d) => ({ id: d.id, ...d.data() })),
          ...snapN.docs.map((d) => ({ id: d.id, ...d.data() })),
        ];

        // de-duplicate by uid/email
        const uniq = [];
        const seen = new Set();
        for (const u of results) {
          const key = u.uid || u.email;
          if (!seen.has(key)) {
            uniq.push(u);
            seen.add(key);
          }
        }

        setUserResults(uniq);
      } catch (err) {
        console.error("User search error:", err);
        setUserResults([]);
      } finally {
        setLoadingUsers(false);
      }

      // posts: client-side filter on allPosts content (case-insensitive)
      const pMatches = allPosts.filter((p) =>
        (p.content || "").toLowerCase().includes(term.toLowerCase())
      );
      setPostResults(pMatches);
    };

    // small debounce
    const t = setTimeout(runSearch, 250);
    return () => clearTimeout(t);
  }, [term, allPosts]);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Search</h1>

      <div className="mb-6">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search users or posts..."
          className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white"
        />
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Users</h2>
        {loadingUsers ? (
          <p>Searching users...</p>
        ) : userResults.length === 0 ? (
          <p className="text-sm text-gray-500">No users found.</p>
        ) : (
          <div className="space-y-3">
            {userResults.map((u) => (
              <div key={u.uid || u.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <img src={u.photoURL || "/default-avatar.png"} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-semibold">{u.name || u.email}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <div className="ml-auto">
                  <a href={`/profile/${u.uid || u.id}`} className="text-sm text-blue-600">View</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Posts</h2>
        {postResults.length === 0 ? (
          <p className="text-sm text-gray-500">No posts matching your search.</p>
        ) : (
          <div className="space-y-4">
            {postResults.map((p) => (
              <div key={p.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold">{p.author}</div>
                    <div className="text-xs text-gray-500">{p.date?.toDate ? p.date.toDate().toLocaleString() : p.date}</div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-200">{p.content}</p>
                <a href={`/feed`} className="text-sm text-blue-600 mt-2 inline-block">Open in feed</a>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
