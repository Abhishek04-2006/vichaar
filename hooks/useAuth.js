"use client";
import { useEffect, useState } from "react";

export default function useAuth() {
  // Lazy initialize from localStorage so we don't call setState synchronously in an effect
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("vichaar_user");
        return storedUser ? JSON.parse(storedUser) : null;
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        return null;
      }
    }
    return null;
  });

  // Keep effect to react to external auth changes if needed (no synchronous setState here)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "vichaar_user") {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (err) {
          console.error("Failed to parse vichaar_user from storage event:", err);
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, []);

  return user;
}
