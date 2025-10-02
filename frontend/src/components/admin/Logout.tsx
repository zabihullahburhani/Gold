"use client";

import React from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
          // لاگ خطا برای دیباگ
          const text = await res.text().catch(()=>null);
          console.error("Logout API returned error:", res.status, text);
        } else {
          // در صورت موفقیت می‌توانید پیام موفقیت نمایش دهید
          console.log("Logout API ok.");
        }
      }
    } catch (err) {
      console.error("Logout fetch failed:", err);
    } finally {
      // توکن را حذف کن حتی اگر درخواست شکست خورد (یا طبق نیازتون این را بعد از موفقیت انجام دهید)
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      router.push("/"); // هدایت به صفحه ورود
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
