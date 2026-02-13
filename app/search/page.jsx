"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Avatar from "@/components/ui/Avatar";
import Postcard from "@/components/Postcard";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  const [term, setTerm] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load all posts for client-side search
  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      setAllPosts(data || []);
    };

    fetchPosts();

    // Subscribe to new posts
    const subscription = supabase
      .channel('search-posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        setAllPosts(prev => [payload.new, ...prev].slice(0, 200));
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  // Search users and posts
  useEffect(() => {
    if (!term) {
      setUserResults([]);
      setPostResults([]);
      return;
    }

    const runSearch = async () => {
      setLoadingUsers(true);
      try {
        // Search users by name or email (case-insensitive)
        const { data: users } = await supabase
          .from('users')
          .select('*')
          .or(`name.ilike.%${term}%,email.ilike.%${term}%`)
          .limit(20);

        setUserResults(users || []);
      } catch (err) {
        console.error("User search error:", err);
        setUserResults([]);
      } finally {
        setLoadingUsers(false);
      }

      // Posts: client-side filter on content
      const pMatches = allPosts.filter((p) =>
        (p.content || "" + p.author_name || "").toLowerCase().includes(term.toLowerCase())
      );
      setPostResults(pMatches);
    };

    // Debounce
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
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
                  key={u.id}
                  href={`/profile/${u.id}`}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700"
                >
                  <Avatar
                    src={u.photo_url}
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
