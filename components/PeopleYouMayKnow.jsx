"use client";
import { useEffect, useState } from "react";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import useAuth from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";

export default function PeopleYouMayKnow() {
    const user = useAuth();
    const [people, setPeople] = useState([]);

    useEffect(() => {
        if (!user?.uid) return;

        const fetchPeople = async () => {
            try {
                // Fetch users (limitation: Firestore no native "random", so we fetch recent/all and shuffle client side for small app)
                // ideally we would filter out `following` in the query but "not-in" has limits and needs non-empty array
                const q = query(collection(db, "users"), limit(20));
                const snap = await getDocs(q);

                const allUsers = snap.docs.map(d => ({ uid: d.id, ...d.data() }));

                // Filter: not me, and not already followed
                const myFollowing = user.following || []; // assuming user object from useAuth/firebase has following array sync'd
                // Note: useAuth is currently from localStorage, might be stale on 'following', 
                // effectively this component might show followed users until refetch/sync.
                // For MVP this is acceptable.

                const suggestions = allUsers.filter(u =>
                    u.uid !== user.uid &&
                    !myFollowing.includes(u.uid)
                );

                setPeople(suggestions.slice(0, 5)); // show top 5
            } catch (err) {
                console.error("Error fetching suggestions:", err);
            }
        };

        fetchPeople();
    }, [user]);

    if (people.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 sticky top-24">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">People you may know</h3>
            <div className="space-y-4">
                {people.map((person) => (
                    <div key={person.uid} className="flex items-center justify-between">
                        <Link href={`/profile/${person.uid}`} className="flex items-center gap-3 hover:opacity-80 transition">
                            <Avatar src={person.photoURL} alt={person.name} size={40} />
                            <div className="overflow-hidden">
                                <p className="font-medium text-sm truncate w-24 sm:w-32">{person.name}</p>
                                <p className="text-xs text-gray-500 truncate w-24 sm:w-32">@{person.email?.split("@")[0]}</p>
                            </div>
                        </Link>
                        {/* Follow button could go here, but for now just link to profile */}
                    </div>
                ))}
            </div>
            <Link
                href="/search"
                className="block mt-4 text-center text-sm text-blue-500 hover:underline"
            >
                See more
            </Link>
        </div>
    );
}
