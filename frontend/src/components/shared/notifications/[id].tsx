"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Notification {
  id: number;
  title: string;
  message: string;
}

export default function NotificationDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    // داده‌های نمونه (در عمل باید از API یا دیتابیس گرفته شود)
    const notifications: Notification[] = [
      { id: 1, title: "پیام جدید", message: "یک پیام جدید دریافت کردید" },
      { id: 2, title: "به‌روزرسانی سیستم", message: "سیستم به‌روزرسانی شد" },
      { id: 3, title: "هشدار امنیتی", message: "رمز عبور خود را تغییر دهید" },
      { id: 4, title: "اطلاعیه", message: "جلسه فردا ساعت 10 برگزار می‌شود" },
    ];

    const notif = notifications.find((n) => n.id === parseInt(id));
    if (notif) setNotification(notif);
    else router.push("/dashboard"); // اگر اعلان پیدا نشد به داشبورد بازگردد
  }, [id, router]);

  if (!notification) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <div className="bg-gray-800 rounded shadow-lg p-6 w-full max-w-md">
        <h1 className="text-xl font-bold mb-2">{notification.title}</h1>
        <p className="text-gray-300 mb-4">{notification.message}</p>

        {/* دکمه بازگشت به داشبورد */}
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-gold-400 text-darkbg rounded hover:bg-yellow-500 transition-colors"
        >
          بازگشت به داشبورد
        </Link>
      </div>
    </div>
  );
}
