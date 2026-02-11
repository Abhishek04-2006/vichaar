"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Newspaper, MessageCircle, Bell, UserPlus, PenSquare, User } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { db } from "@/app/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [ready, setReady] = useState(false);

  // Hide Navbar on Auth Pages (Logic moved to return)
  const isAuthPage = ["/login", "/signup", "/register"].includes(pathname);

  // -------------------------------
  // 1. Run once on mount
  // -------------------------------
  useEffect(() => {
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
      } catch { }
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
  }, [user, userData?.photoURL]);

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
  const handleLogout = async () => {
    try {
      const { auth } = await import("@/app/firebase/firebaseConfig");
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
    } catch (e) {
      console.error("Logout error", e);
    }
    localStorage.removeItem("vichaar_user");
    setUser(null);
    setUserData(null);
    window.location.href = "/login";
  };

  // -------------------------------
  // 5. Avoid hydration mismatch or Auth Page hidden
  // -------------------------------
  if (!ready || isAuthPage) {
    return null; // Or return a skeleton if you want; for auth page we return null
  }

  // -------------------------------
  // 6. Render Navbar
  // -------------------------------
  return (
    <nav
      className={`w-full shadow-md ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
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
          <Link href="/" title="Home" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><Home size={24} /></Link>
          <Link href="/feed" title="Feed" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><Newspaper size={24} /></Link>
          <Link href="/chat" title="Messages" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><MessageCircle size={24} /></Link>
          <Link href="/notifications" title="Notifications" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><Bell size={24} /></Link>
          <Link href="/find-people" title="Connect" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><UserPlus size={24} /></Link>
          <Link href="/publish" title="Publish" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><PenSquare size={24} /></Link>
          <Link href="/profile" title="Profile" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><User size={24} /></Link>

          <button
            onClick={toggleDarkMode}
            className="border px-2 py-1 rounded-md"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Avatar
                src={userData?.photoURL}
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
          className={`flex flex-col items-center pb-4 md:hidden ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
            }`}
        >
          <Link href="/" className="flex items-center gap-2 py-2 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800"><Home size={20} /> Home</Link>
          <Link href="/feed" className="flex items-center gap-2 py-2 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800"><Newspaper size={20} /> Feed</Link>
          <Link href="/chat" className="flex items-center gap-2 py-2 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800"><MessageCircle size={20} /> Messages</Link>
          <Link href="/notifications" className="flex items-center gap-2 py-2 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800"><Bell size={20} /> Notifications</Link>
          <Link href="/find-people" className="flex items-center gap-2 py-2 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800"><UserPlus size={20} /> Connect</Link>
          <Link href="/publish" className="flex items-center gap-2 py-2 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800"><PenSquare size={20} /> Publish</Link>
          <Link href="/profile" className="flex items-center gap-2 py-2 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800"><User size={20} /> Profile</Link>

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
