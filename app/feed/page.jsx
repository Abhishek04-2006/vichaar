"use client";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import useAuth from "@/hooks/useAuth";
import Postcard from "@/components/Postcard";
import PeopleYouMayKnow from "@/components/PeopleYouMayKnow";

export default function Feed() {
  const user = useAuth();
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]);

  // get following list
  useEffect(() => {
    if (!user?.uid) return;

    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      snap => {
        setFollowing(snap.data()?.following || []);
      }
    );

    return () => unsub();
  }, [user]);

  // feed posts
  useEffect(() => {
    if (!following || following.length === 0) {
      setPosts([]); // Clear posts when not following anyone
      return;
    }

    const q = query(
      collection(db, "posts"),
      where("authorId", "in", following)
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetchedPosts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort by createdAt client-side to avoid needing a composite index
      const sortedPosts = fetchedPosts.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime; // desc order
      });
      setPosts(sortedPosts);
    });

    return () => unsub();
  }, [following]);


  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Main Feed */}
      <div className="md:col-span-2 space-y-4">
        {following.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            Follow people to see posts 👀
          </p>
        )}
        {posts.map(post => (
          <Postcard key={post.id} post={post} />
        ))}
      </div>

      {/* Sidebar (Hidden on mobile) */}
      <div className="hidden md:block">
        <PeopleYouMayKnow />
      </div>
    </div>
  );
}
