"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // آیکون‌ها

interface SidebarProps {
  active: string;
  setActive: (comp: string) => void;
}

export default function Sidebar({ active, setActive }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const items = [
    "Customers",
    "Employees",
    "GoldPrices",
    "Transactions",
    "GoldRateDifferences",
    "ShopExpenses",
    "UserProfile",
    "Logout",
  ];

  return (
    <>
      {/* 📌 دکمه منو فقط در موبایل */}
      <div className="md:hidden p-2 bg-gray-900 flex justify-between items-center">
        <button
          onClick={() => setOpen(true)}
          className="text-gold-400 flex items-center gap-2"
        >
          <Menu className="w-6 h-6" />
          منو
        </button>
      </div>

      {/* 📌 Sidebar ثابت در دسکتاپ */}
      <aside className="hidden md:flex w-52 bg-gray-800 p-4 flex-col gap-2">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={`text-right p-2 rounded ${
              active === item
                ? "bg-yellow-400 text-gray-900"
                : "text-yellow-400 hover:bg-gray-700"
            }`}
          >
            {item}
          </button>
        ))}
      </aside>

      {/* 📌 Sidebar کشویی در موبایل */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* پس‌زمینه نیمه‌شفاف */}
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setOpen(false)}
          />
          {/* پنل کشویی */}
          <div className="w-64 bg-gray-800 p-4 flex flex-col gap-2 animate-slideInRight">
            <button
              onClick={() => setOpen(false)}
              className="self-end text-yellow-400 mb-4"
            >
              <X className="w-6 h-6" />
            </button>
            {items.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActive(item);
                  setOpen(false);
                }}
                className={`text-right p-2 rounded ${
                  active === item
                    ? "bg-yellow-400 text-gray-900"
                    : "text-yellow-400 hover:bg-gray-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
