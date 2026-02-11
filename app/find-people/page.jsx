"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import useAuth from "@/hooks/useAuth";
import FollowButton from "@/components/FollowButton";

export default function FindPeople() {
  const user = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.id !== user.uid);

      setUsers(list);
    };

    fetchUsers();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Connect & Discover</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Find inspiring people to follow and grow your network.</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No new people to discover right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  {u.photoURL ? (
                    <Image src={u.photoURL} alt={u.name || "User"} width={56} height={56} className="w-14 h-14 rounded-full object-cover ring-2 ring-white dark:ring-gray-700" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-300">
                      {(u.name || u.email)?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>

                <div className="overflow-hidden">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate text-lg group-hover:text-blue-600 transition-colors">
                    {u.name || "Anonymous User"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    @{u.email?.split("@")[0]}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {u.followers?.length || 0} Followers
                </span>
                <FollowButton
                  currentUid={user.uid}
                  targetUid={u.id}
                  isFollowing={u.followers?.includes(user.uid)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
