"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const router = useRouter();

  const user = {
    name: "برهانی",
    avatar: "/icons/user.png",
  };

  const handleLogout = () => {
    router.push("/"); // ریدایرکت به صفحه اصلی بعد از خروج
  };

  return (
    <div className="topbar flex items-center justify-end p-3 bg-gray-900 text-white shadow-md md:gap-4 gap-2">
      
      {/* تصویر و نام کاربر */}
      <div className="flex items-center gap-2">
        <Image
          src={user.avatar}
          alt="تصویر پروفایل"
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="hidden sm:block">{user.name}</span>
      </div>

      {/* دکمه خروج */}
      <button
        onClick={handleLogout}
        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
      >
        خروج
      </button>
    </div>
  );
}
