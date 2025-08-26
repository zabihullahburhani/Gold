"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiBell } from "react-icons/fi";

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
}

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);

  // نمونه اعلان‌ها
  useEffect(() => {
    setNotifications([
      { id: 1, title: "پیام جدید", message: "یک پیام جدید دریافت کردید", read: false },
      { id: 2, title: "به‌روزرسانی سیستم", message: "سیستم به‌روزرسانی شد", read: true },
      { id: 3, title: "هشدار امنیتی", message: "رمز عبور خود را تغییر دهید", read: false },
      { id: 4, title: "اطلاعیه", message: "جلسه فردا ساعت 10 برگزار می‌شود", read: true },
    ]);
  }, []);

  // بستن Popover وقتی کلیک خارج شد
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickNotification = (id: number) => {
    // اعلان را به حالت خوانده شده تغییر بده
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setOpen(false);
    router.push(`/notifications/${id}`); // مسیر جداگانه برای جزئیات هر اعلان
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* آیکن Notification کوچک */}
      <button
        className="relative p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <FiBell size={20} className="text-gold-400" />
        {/* تعداد اعلان‌های خوانده نشده */}
        {notifications.filter((n) => !n.read).length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            {notifications.filter((n) => !n.read).length}
          </span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 md:w-80 bg-gray-800 text-white rounded shadow-lg z-50 animate-fade-in">
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleClickNotification(notif.id)}
                className={`px-4 py-2 cursor-pointer border-b last:border-b-0 hover:bg-gray-700 transition-colors ${
                  !notif.read ? "bg-gray-700 font-semibold" : ""
                }`}
              >
                <p className="text-sm">{notif.title}</p>
                <p className="text-xs text-gray-300">{notif.message}</p>
              </div>
            ))}
          </div>
          {notifications.length === 0 && (
            <div className="p-4 text-center text-gray-400">اعلانی موجود نیست</div>
          )}
        </div>
      )}

      {/* انیمیشن Fade-in */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
