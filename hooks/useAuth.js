"use client";
import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("vichaar_user");
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, []);

  return user;
}
