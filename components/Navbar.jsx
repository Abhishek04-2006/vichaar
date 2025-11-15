"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { db } from "@/app/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [ready, setReady] = useState(false);

  // -------------------------------
  // 1. Run once on mount
  // -------------------------------
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);

    // Load theme
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    // Load saved user
    const stored = localStorage.getItem("vichaar_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        if (parsed.photoURL) setUserData(parsed);
      } catch {}
    }
  }, []);

  // -------------------------------
  // 2. Fetch Firestore user if missing
  // -------------------------------
  useEffect(() => {
    if (!user?.uid) return;
    if (userData?.photoURL) return;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserData(snap.data());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user]);

  // -------------------------------
  // 3. Toggle dark mode
  // -------------------------------
  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem("theme", newValue ? "dark" : "light");

    document.documentElement.classList.toggle("dark", newValue);
  };

  // -------------------------------
  // 4. Logout
  // -------------------------------
  const handleLogout = () => {
    localStorage.removeItem("vichaar_user");
    setUser(null);
    setUserData(null);
    window.location.href = "/login";
  };

  // -------------------------------
  // 5. Avoid hydration mismatch
  // -------------------------------
  if (!ready) {
    return <nav className="h-16 bg-white dark:bg-gray-900 shadow"></nav>;
  }

  // -------------------------------
  // 6. Render Navbar
  // -------------------------------
  return (
    <nav
      className={`w-full shadow-md ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/">
          <Image
            src="/vichaar-logo.svg"
            width={130}
            height={40}
            alt="Vichaar Logo"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/">Home</Link>
          <Link href="/feed">Feed</Link>
          <Link href="/publish">Publish</Link>
          <Link href="/profile">Profile</Link>

          <button
            onClick={toggleDarkMode}
            className="border px-2 py-1 rounded-md"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Avatar
                src={userData?.photoURL || "/default-avatar.png"}
                size={36}
              />
              <span>{userData?.name || user.email}</span>

              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded-md text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-blue-500 px-3 py-1 text-white rounded-md">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-md"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className={`flex flex-col items-center pb-4 md:hidden ${
            darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
        >
          <Link href="/">Home</Link>
          <Link href="/feed">Feed</Link>
          <Link href="/publish">Publish</Link>
          <Link href="/profile">Profile</Link>

          <button
            onClick={toggleDarkMode}
            className="border px-3 py-1 rounded-md my-2"
          >
            {darkMode ? "🌙 Dark" : "☀️ Light"}
          </button>

          {user ? (
            <>
              <p>{userData?.name || user.email}</p>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded-md text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-blue-500 px-3 py-1 rounded-md text-white"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
