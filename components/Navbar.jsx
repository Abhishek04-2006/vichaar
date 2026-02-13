"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Newspaper, MessageCircle, Bell, UserPlus, PenSquare, User, Bookmark, Moon, Sun } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [ready, setReady] = useState(false);

  // Hide Navbar on Auth Pages
  const isAuthPage = ["/login", "/signup", "/register"].includes(pathname);

  useEffect(() => {
    setReady(true);

    // Load theme
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    // Auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user metadata from public table
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (data) setUserData(data);
        } else {
          setUserData(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem("theme", newValue ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newValue);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("vichaar_user"); // cleanup legacy
    window.location.href = "/login";
  };

  if (!ready || isAuthPage) return null;

  return (
    <nav className={`w-full shadow-md ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* Fallback text logo if image fails or while loading */}
          <span className="font-bold text-2xl tracking-tighter text-blue-600 dark:text-blue-400">VICHAAR</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" title="Home" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><Home size={24} /></Link>
          <Link href="/feed" title="Feed" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><Newspaper size={24} /></Link>
          <Link href="/chat" title="Messages" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><MessageCircle size={24} /></Link>
          <Link href="/notifications" title="Notifications" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><Bell size={24} /></Link>
          <Link href="/bookmarks" title="Bookmarks" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><Bookmark size={24} /></Link>
          <Link href="/find-people" title="Connect" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><UserPlus size={24} /></Link>
          <Link href="/publish" title="Publish" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><PenSquare size={24} /></Link>
          <Link href="/profile" title="Profile" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><User size={24} /></Link>

          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Moon size={24} className="text-blue-400" /> : <Sun size={24} className="text-yellow-500" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l dark:border-gray-700">
              <Link href="/profile">
                <Avatar src={userData?.photo_url || user.user_metadata?.avatar_url} size={36} />
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-500 hover:text-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={`flex flex-col items-center pb-4 md:hidden ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
          <Link onClick={() => setMenuOpen(false)} href="/" className="flex items-center gap-3 py-3 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-800"><Home size={20} /> Home</Link>
          <Link onClick={() => setMenuOpen(false)} href="/feed" className="flex items-center gap-3 py-3 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-800"><Newspaper size={20} /> Feed</Link>
          <Link onClick={() => setMenuOpen(false)} href="/chat" className="flex items-center gap-3 py-3 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-800"><MessageCircle size={20} /> Messages</Link>
          <Link onClick={() => setMenuOpen(false)} href="/notifications" className="flex items-center gap-3 py-3 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-800"><Bell size={20} /> Notifications</Link>
          <Link onClick={() => setMenuOpen(false)} href="/bookmarks" className="flex items-center gap-3 py-3 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-800"><Bookmark size={20} /> Bookmarks</Link>
          <Link onClick={() => setMenuOpen(false)} href="/find-people" className="flex items-center gap-3 py-3 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-800"><UserPlus size={20} /> Connect</Link>
          <Link onClick={() => setMenuOpen(false)} href="/publish" className="flex items-center gap-3 py-3 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-800"><PenSquare size={20} /> Publish</Link>
          <Link onClick={() => setMenuOpen(false)} href="/profile" className="flex items-center gap-3 py-3 w-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-800"><User size={20} /> Profile</Link>

          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 w-full px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-800"
          >
            {darkMode ? (
              <><Moon size={20} className="text-blue-400" /> Dark Mode</>
            ) : (
              <><Sun size={20} className="text-yellow-500" /> Light Mode</>
            )}
          </button>

          {user ? (
            <div className="w-full px-6 py-3">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg text-white font-medium transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="w-full px-6 py-3">
              <Link
                onClick={() => setMenuOpen(false)}
                href="/login"
                className="block text-center w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white font-medium transition"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
