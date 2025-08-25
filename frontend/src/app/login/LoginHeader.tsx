"use client";
import Image from "next/image";

export default function LoginHeader() {
  return (
    <header className="bg-gray-900 text-gold-400 py-4 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center gap-4 px-4">
        <Image
          src="/icons/icon.png"
          alt="Shop Logo"
          width={50}
          height={50}
          className="rounded-full"
        />

        <div>
          <h1 className="text-xl font-bold">سیستم مدیریت طلای GJBMS</h1>
          <p className="text-sm">شرکت نمونه | تماس: +93 705002913</p>
        </div>
      </div>
    </header>
  );
}
