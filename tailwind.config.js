/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vichaar: {
          primary: "#2563EB",
          primaryDark: "#3B82F6",
          secondary: "#64748B",
          secondaryDark: "#94A3B8",
          bg: "#F8FAFC",
          bgDark: "#0F172A",
          card: "#FFFFFF",
          cardDark: "#1E293B",
          accent: "#22C55E",
          accentDark: "#4ADE80",
          danger: "#EF4444",
          dangerDark: "#DC2626",
        },
      },
    },
  },
  plugins: [],
};
