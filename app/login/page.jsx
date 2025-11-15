"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Beautiful minimal login page for Vichaar (Option A)
 * - paste as app/login/page.jsx
 * - wire the handleLogin() function to your auth logic (firebase or custom)
 */

const QUOTES = [
  "Ideas matter — share yours.",
  "Write. Publish. Converse.",
  "Clarity wins — say it simply.",
  "A thought shared becomes a conversation.",
  "Small ideas build big change."
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // wire this to your actual auth (firebase) implementation.
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Example: if you have a signIn function exported from app/firebase/auth.js
      // import { signIn } from "@/app/firebase/auth";
      // await signIn(email, password);

      // ---- Placeholder: simulate success after 700ms ----
      await new Promise((r) => setTimeout(r, 700));
      // redirect to feed/profile etc.
      window.location.href = "/feed";
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left: Branding + quote */}
          <div className="relative p-10 md:p-16 flex flex-col justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            {/* Floating subtle shapes */}
            <div className="absolute -left-10 -top-10 w-56 h-56 rounded-full bg-white/5 blur-3xl transform rotate-12"></div>
            <div className="absolute -right-16 bottom-8 w-72 h-72 rounded-full bg-white/3 blur-2xl"></div>

            <div className="z-10">
              <div className="flex items-center space-x-3 mb-6">
                <Image src="/vichaar-logo.svg" alt="Vichaar" width={120} height={36} priority />
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
                The social space for <span className="text-blue-200">modern thinkers</span>
              </h2>

              <p className="text-sm md:text-base text-blue-100/90 max-w-xl">
                Join a focused community where ideas are shared and conversations matter.
              </p>

              {/* Rotating quote */}
              <div
                aria-live="polite"
                className="mt-8 text-sm md:text-base text-blue-100/90 italic transition-opacity duration-700"
              >
                <span className="opacity-80">“</span>
                <span className="ml-1 font-medium">{QUOTES[quoteIndex]}</span>
                <span className="opacity-80">”</span>
              </div>

              {/* subtle CTA */}
              <div className="mt-8">
                <Link href="/signup" className="inline-block bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition">
                  Create an account
                </Link>
              </div>
            </div>

            {/* small footer */}
            <div className="z-10 mt-auto text-xs text-blue-100/60 pt-8">
              By continuing you agree to our <Link href="/terms" className="underline">Terms</Link>.
            </div>
          </div>

          {/* Right: Form */}
          <div className="p-8 md:p-14 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Welcome back</h3>
              <p className="text-sm text-gray-500 mb-6">Sign in to continue to Vichaar</p>

              <form onSubmit={handleLogin} className="space-y-4">
                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

                <label className="block">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="you@domain.com"
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Password</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="••••••••"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>

                <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                  <Link href="/forgot" className="hover:underline">Forgot password?</Link>
                  <Link href="/signup" className="hover:underline">Create account</Link>
                </div>

                <div className="my-4 flex items-center">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="px-3 text-xs text-gray-400">Or continue with</div>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                </div>

                {/* social buttons placeholders */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => alert("Wire Google sign-in here")}
                    className="flex items-center justify-center gap-2 border rounded-md py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48" fill="none" aria-hidden>
                      <path d="M44 20H24v8h11.8C34.6 31.9 30.8 36 24 36 15.2 36 8 28.8 8 20S15.2 4 24 4c6 0 10 2.6 12.3 5.2l6.7-6.7C38.3 1.7 31.6 0 24 0 10.7 0 0 10.7 0 24s10.7 24 24 24c13.3 0 24-10.7 24-24 0-1.6-.2-3.1-.6-4.6z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("Wire GitHub sign-in here")}
                    className="flex items-center justify-center gap-2 border rounded-md py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.2.8-.5v-2c-3.3.7-4-1.6-4-1.6-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-2.5-.3-5.2-1.3-5.2-5.9 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.4 1.2a12 12 0 016.3 0C18 6 19 6.3 19 6.3c.6 1.7.2 3 .1 3.3.7.8 1.2 1.8 1.2 3.1 0 4.6-2.7 5.6-5.3 5.9.4.4.8 1 .8 2v3c0 .3.2.6.8.5A12 12 0 0012 .5z" fill="currentColor"/>
                    </svg>
                    GitHub
                  </button>
                </div>
              </form>

              {/* small skip link for dev */}
              <div className="mt-6 text-xs text-gray-400">
                <span>Need help? </span>
                <Link href="/help" className="underline">Contact support</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
