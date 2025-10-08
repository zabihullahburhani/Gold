"use client";

import React from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    if (typeof window === "undefined") return; // بررسی محیط

    const token = localStorage.getItem("token");

    try {
      if (token) {
        const res = await fetch(`${API_BASE}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => null);
          console.error("❌ Logout API returned error:", res.status, text);
        } else {
          console.log("✅ Logout successful");
        }
      }
    } catch (err) {
      console.error("❌ Logout request failed:", err);
    } finally {
      // حذف توکن همیشه
      localStorage.removeItem("token");

      // هدایت به صفحه ورود
      router.push("/login"); // یا "/" طبق نیاز شما
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="block w-full text-right mt-4 text-yellow-300 hover:text-yellow-500"
    >
      خروج
    </button>
  );
}
