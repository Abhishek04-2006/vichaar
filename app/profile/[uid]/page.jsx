"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import useAuth from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";

export default function OtherProfile({ params }) {
  const { uid } = use(params);
  const currentUser = useAuth();
  const router = useRouter();
  const [startingChat, setStartingChat] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load Profile User
  useEffect(() => {
    async function fetchData() {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          setUser(snap.data());
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [uid]);

  const handleMessage = async () => {
    if (!currentUser) return alert("Login to message users");
    if (startingChat) return;
    setStartingChat(true);

    try {
      // 1. Check if chat exists
      // Firestore limitaion: array-contains can only be used once. 
      // We query for chats involving ME, then filter for THEM.
      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", currentUser.uid)
      );
      const snap = await getDocs(q);

      const existingChat = snap.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(uid);
      });

      if (existingChat) {
        router.push(`/chat/${existingChat.id}`);
      } else {
        // 2. Create new chat
        const newChat = await addDoc(collection(db, "chats"), {
          participants: [currentUser.uid, uid],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: "",
          startedBy: currentUser.uid
        });
        router.push(`/chat/${newChat.id}`);
      }
    } catch (err) {
      console.error("Chat start error", err);
      alert("Failed to start chat");
      setStartingChat(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading profile...</div>;

  if (!user) return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold text-gray-700">User not found</h2>
      <p className="text-gray-500">The user you are looking for does not exist.</p>
    </div>
  );

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex flex-col items-center md:items-start">
        <Avatar
          src={user.photoURL}
          size={128}
        />
        <h1 className="text-2xl font-extrabold mt-4 text-gray-900 dark:text-white">{user.name || user.email?.split("@")[0]}</h1>
        <p className="text-gray-500 dark:text-gray-400">@{user.email?.split("@")[0]}</p>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          {currentUser?.uid !== uid && (
            <button
              onClick={handleMessage}
              disabled={startingChat}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition disabled:opacity-50"
            >
              {startingChat ? "Opening..." : "Message"}
            </button>
          )}
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm w-full">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 border-b pb-2 mb-2">About</h3>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{user.bio || "No bio available."}</p>
        </div>
      </div>
    </main>
  );
}
