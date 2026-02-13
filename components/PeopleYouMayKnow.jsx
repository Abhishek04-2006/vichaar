"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import useAuth from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";

export default function PeopleYouMayKnow() {
    const { user } = useAuth();
    const [people, setPeople] = useState([]);

    useEffect(() => {
        if (!user?.id) return;

        const fetchPeople = async () => {
            try {
                // Get my following list
                const { data: myUser } = await supabase
                    .from('users')
                    .select('following')
                    .eq('id', user.id)
                    .single();

                const following = myUser?.following || [];

                // Fetch other users
                const { data: allUsers } = await supabase
                    .from('users')
                    .select('*')
                    .neq('id', user.id)
                    .limit(20);

                if (allUsers) {
                    const suggestions = allUsers.filter(u => !following.includes(u.id));
                    setPeople(suggestions.slice(0, 5));
                }
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
                    <div key={person.id} className="flex items-center justify-between">
                        <Link href={`/profile/${person.id}`} className="flex items-center gap-3 hover:opacity-80 transition">
                            <Avatar src={person.photo_url} alt={person.name} size={40} />
                            <div className="overflow-hidden">
                                <p className="font-medium text-sm truncate w-24 sm:w-32 dark:text-gray-200">{person.name}</p>
                                <p className="text-xs text-gray-500 truncate w-24 sm:w-32">@{person.email?.split("@")[0]}</p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
            <Link
                href="/find-people"
                className="block mt-4 text-center text-sm text-blue-500 hover:underline"
            >
                See more
            </Link>
        </div>
    );
}
