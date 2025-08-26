"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  const handleLogout = () => {
    // در پروژه واقعی: توکن را پاک کن، سشن را ببند و غیره
    console.log("خروج انجام شد");

    // ری‌دایرکت به صفحه ورود
    router.push("/");
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
