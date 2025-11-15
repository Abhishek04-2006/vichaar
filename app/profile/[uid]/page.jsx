// app/profile/[uid]/page.jsx (server or client)
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";

export default async function OtherProfile({ params }) {
  const { uid } = params;
  const snap = await getDoc(doc(db, "users", uid));
  const user = snap.exists() ? snap.data() : null;

  if (!user) return <p>User not found</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <img src={user.photoURL || "/default-avatar.png"} className="w-24 h-24 rounded-full" />
      <h1 className="text-xl font-bold mt-3">{user.name || user.email}</h1>
      <p className="text-sm text-gray-500">{user.bio}</p>
      {/* optionally fetch posts authored by uid */}
    </main>
  );
}
