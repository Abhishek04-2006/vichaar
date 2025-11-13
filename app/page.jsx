"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">

      {/* ========================================= */}
      {/* HERO SECTION */}
      {/* ========================================= */}
      <section className="relative pt-40 pb-32 px-6 max-w-7xl mx-auto">

        {/* Gradient Background Blobs */}
        <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-20">
          <div className="w-[700px] h-[700px] bg-blue-600 opacity-20 dark:opacity-10 rounded-full blur-3xl absolute -top-32 -left-32 animate-pulse"></div>
          <div className="w-[700px] h-[700px] bg-purple-600 opacity-20 dark:opacity-10 rounded-full blur-3xl absolute bottom-0 right-0 animate-pulse"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-6xl font-extrabold leading-tight tracking-tight mb-6">
            The Social Platform for
            <span className="text-blue-600 dark:text-blue-400"> Modern Thinkers</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
            VICHAAR helps you share ideas, publish thoughts and engage in real-time conversations — beautifully.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/signup" className="px-8 py-3 text-lg rounded-xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition">
              Start for Free
            </Link>
            <Link href="/feed" className="px-8 py-3 text-lg rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              Live Demo
            </Link>
          </div>
        </motion.div>

        {/* Product Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 flex justify-center"
        >
          <div className="w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Image
              src="/og-image.png"
              alt="Vichaar Feed Preview"
              width={1600}
              height={900}
              className="w-full object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* ========================================= */}
      {/* FEATURES */}
      {/* ========================================= */}
      <section id="features" className="py-28 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-16">Powerful Features Built for You</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {[ 
              { icon: "📝", title: "Publish Ideas", desc: "Share your thoughts instantly with a clean UI." },
              { icon: "⚡", title: "Real-time Feed", desc: "Instant updates with Firebase Sync." },
              { icon: "💬", title: "Engage Smarter", desc: "Like and comment with a thoughtful community." }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg"
              >
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-2xl font-semibold mb-3">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{f.desc}</p>
              </motion.div>
            ))}

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-28 max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-16">Simple. Fast. Effective.</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
          {["Create account", "Publish thoughts", "Engage real-time"].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <div className="text-6xl mb-4">{i + 1}️⃣</div>
              <h3 className="text-2xl font-semibold capitalize">{step}</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Your journey begins effortlessly.</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-28 text-center bg-blue-600 text-white relative overflow-hidden">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-extrabold mb-6">Start sharing your Vichaar today</h2>
          <p className="text-xl opacity-90 mb-10">Join a growing community of thinkers.</p>

          <Link href="/signup" className="px-10 py-4 text-xl bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:opacity-90">
            Create Your Account
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 text-center text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} VICHAAR — Designed & Developed with ❤️
      </footer>
    </div>
  );
}