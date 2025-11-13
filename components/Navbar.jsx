"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();

  // ✅ States
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

useEffect(() => {
  // ✅ Delay all state updates to avoid synchronous warnings
  const timer = setTimeout(() => {
    setMounted(true);

    try {
      const savedUser = JSON.parse(localStorage.getItem("vichaar_user") || "null");
      const savedTheme = localStorage.getItem("theme");

      if (savedUser) setUser(savedUser);

      if (savedTheme === "dark") {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (err) {
      console.error("Error loading user/theme:", err);
    }
  }, 0);

  // ✅ Cleanup timer on unmount
  return () => clearTimeout(timer);
}, []);

  


  // ✅ Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("vichaar_user");
    setUser(null);
    router.push("/login");
  };

  // ✅ Prevent mismatch during hydration
  if (!mounted) return <nav className="h-14 bg-white dark:bg-gray-900"></nav>;

  return (
    <nav
      className={`w-full shadow-md ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Image
           src="/vichaar-logo.svg"
          alt="Vichaar Logo"
        width={140}
        height={40}
       />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-blue-500">
            Home
          </Link>
          <Link href="/feed" className="hover:text-blue-500">
            Feed
          </Link>
          <Link href="/publish" className="hover:text-blue-500">
            Publish
          </Link>
          <Link href="/profile" className="hover:text-blue-500">
            Profile
          </Link>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="border rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>

          {/* Auth Buttons */}
          {user ? (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, <strong>{user.name || user.email}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className={`flex flex-col items-center md:hidden space-y-3 pb-4 ${
            darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
        >
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/feed" onClick={() => setMenuOpen(false)}>
            Feed
          </Link>
          <Link href="/publish" onClick={() => setMenuOpen(false)}>
            Publish
          </Link>
          <Link href="/profile" onClick={() => setMenuOpen(false)}>
            Profile
          </Link>

          {/* Mobile Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="border rounded-md px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          >
            {darkMode ? "🌙 Dark" : "☀️ Light"}
          </button>

          {/* Auth Buttons */}
          {user ? (
            <>
              <p className="text-sm">Hi, {user.name || user.email}</p>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
