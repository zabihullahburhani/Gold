"use client";
import React from "react";
import Image from "next/image";
import Notifications from "./admin/Notifications";

export default function Header() {
  return (
    <header className="header flex flex-col md:flex-row items-center justify-between p-4 bg-gray-900 text-gold-400 shadow-md relative">
      
      {/* لوگو و نام شرکت */}
      <div className="flex items-center gap-3 mb-3 md:mb-0">
        <Image
          src="/icons/icon1.png"
          alt="لوگو دوکان"
          width={50}
          height={50}
          className="rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-sm">شرکت سازنده: BrainBridge Co.</span>
        </div>
              {/* Notification */}
      <div className="ml-auto md:ml-0">
        <Notifications />
      </div>
      </div>

      {/* سرچ باکس */}
      <div className="flex w-full md:w-auto gap-2 mb-3 md:mb-0">
        <input
          type="text"
          placeholder="جستجو..."
          className="flex-1 px-3 py-2 rounded-l bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gold-400"
        />
        <button className="px-4 py-2 bg-gold-400 text-darkbg font-bold rounded-r hover:bg-yellow-500 transition-colors">
          جستجو
        </button>
      </div>


    </header>
  );
}
