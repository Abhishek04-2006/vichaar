"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/app/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import Avatar from "@/components/ui/Avatar";
import Postcard from "@/components/Postcard";

export default function SearchPage() {
  const [term, setTerm] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // realtime load all posts (small optimization: only latest 200)
  // In a real app we'd use Algolia or TypeSense for full-text search
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
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
        (p.content || "" + p.authorName || "").toLowerCase().includes(term.toLowerCase())
      );
      setPostResults(pMatches);
    };

    // small debounce
    const t = setTimeout(runSearch, 300);
    return () => clearTimeout(t);
  }, [term, allPosts]);

  return (
    <main className="max-w-4xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Explore</h1>

      <div className="mb-8 sticky top-4 z-10">
        <div className="relative">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search for people or topics..."
            className="w-full p-4 pl-12 rounded-full border border-gray-200 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col: Users */}
        <section className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">People</h2>
          {loadingUsers ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>)}
            </div>
          ) : userResults.length === 0 && term ? (
            <p className="text-sm text-gray-500">No people found searching for &quot;{term}&quot;</p>
          ) : !term ? (
            <p className="text-sm text-gray-400">Type to search people...</p>
          ) : (
            <div className="space-y-3">
              {userResults.map((u) => (
                <Link
                  key={u.uid || u.id}
                  href={`/profile/${u.uid || u.id}`}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700"
                >
                  <Avatar
                    src={u.photoURL}
                    size={48}
                  />
                  <div className="overflow-hidden">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{u.name || (u.email?.split('@')[0])}</div>
                    <div className="text-xs text-gray-500 truncate">@{u.email?.split('@')[0]}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Right Col: Posts */}
        <section className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">Posts</h2>
          {postResults.length === 0 ? (
            term ? <p className="text-gray-500">No posts found.</p> : <p className="text-gray-400">Search for topics to see discussions.</p>
          ) : (
            <div className="space-y-6">
              {postResults.map((p) => (
                <Postcard key={p.id} post={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
