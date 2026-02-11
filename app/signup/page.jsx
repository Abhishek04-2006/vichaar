"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const { auth, db } = await import("@/app/firebase/firebaseConfig");
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const { doc, setDoc } = await import("firebase/firestore");

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // Create user doc
      const userData = {
        name,
        email,
        bio: "Just joined Vichaar!",
        createdAt: new Date(),
        followers: [],
        following: [],
        photoURL: null,
        coverURL: null
      };

      await setDoc(doc(db, "users", user.uid), userData);

      // Save to localStorage for useAuth hook compatibility
      const localData = { uid: user.uid, ...userData };
      localStorage.setItem("vichaar_user", JSON.stringify(localData));
      window.dispatchEvent(new Event("storage"));

      alert("Signup successful!");
      router.push("/feed");

    } catch (err) {
      console.error(err);
      alert("Signup failed: " + err.message);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          Create Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
          >
            Sign Up
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                const { auth, db, GoogleAuthProvider } = await import("@/app/firebase/firebaseConfig");
                const { signInWithPopup } = await import("firebase/auth");
                const { doc, getDoc, setDoc } = await import("firebase/firestore");

                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                const user = result.user;

                // Check if user exists
                const userRef = doc(db, "users", user.uid);
                const snap = await getDoc(userRef);

                let userData;

                if (snap.exists()) {
                  // User exists, just log them in
                  userData = { uid: user.uid, email: user.email, ...snap.data() };
                } else {
                  // New user, create doc
                  userData = {
                    name: user.displayName || user.email.split("@")[0],
                    email: user.email,
                    bio: "Just joined Vichaar!",
                    createdAt: new Date(),
                    followers: [],
                    following: [],
                    photoURL: user.photoURL,
                    coverURL: null
                  };
                  await setDoc(userRef, userData);
                  userData = { uid: user.uid, ...userData };
                }

                // Sync local and redirect
                localStorage.setItem("vichaar_user", JSON.stringify(userData));
                window.dispatchEvent(new Event("storage"));
                router.push("/feed");

              } catch (err) {
                console.error("Google Signup Error:", err);
                alert("Signup failed: " + err.message);
              }
            }}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition dark:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none" aria-hidden>
              <path d="M44 20H24v8h11.8C34.6 31.9 30.8 36 24 36 15.2 36 8 28.8 8 20S15.2 4 24 4c6 0 10 2.6 12.3 5.2l6.7-6.7C38.3 1.7 31.6 0 24 0 10.7 0 0 10.7 0 24s10.7 24 24 24c13.3 0 24-10.7 24-24 0-1.6-.2-3.1-.6-4.6z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}
