"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import useAuth from "@/hooks/useAuth";
import FollowButton from "@/components/FollowButton";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";

export default function FindPeople() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', user.id)
        .limit(50);

      if (error) {
        console.error(error);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-gray-500 mb-6">Please login to discover people</p>
          <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Connect & Discover
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Find inspiring people to follow and grow your network.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No new people to discover right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u) => (
            <Link
              key={u.id}
              href={`/profile/${u.id}`}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <Avatar src={u.photo_url} size={56} className="ring-2 ring-white dark:ring-gray-700" />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>

                <div className="overflow-hidden flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate text-lg group-hover:text-blue-600 transition-colors">
                    {u.name || "Anonymous User"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    @{u.email?.split("@")[0]}
                  </p>
                </div>
              </div>

              {u.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {u.bio}
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {u.followers?.length || 0} Followers
                </span>
                <FollowButton
                  currentUid={user.id}
                  targetUid={u.id}
                  isFollowing={u.followers?.includes(user.id)}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
