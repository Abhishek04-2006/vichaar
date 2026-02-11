"use client";
import { useEffect, useState } from "react";

export default function useAuth() {
  /* 
    Fix for Hydration Mismatch and React Effect Rules: 
    Always initialize with null. We use a lazy initializer pattern
    that only runs on the client side to avoid hydration mismatches.
  */
  const [user, setUser] = useState(() => {
    // This initializer only runs once on mount
    if (typeof window === "undefined") return null;

    try {
      const storedUser = localStorage.getItem("vichaar_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Failed to parse stored user:", e);
      return null;
    }
  });

  // Listen for storage changes from other tabs/windows
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
