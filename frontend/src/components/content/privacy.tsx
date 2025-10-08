"use client";
import React from "react";

export default function PrivacyPage() {
  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl min-h-[70vh] w-full max-w-4xl mx-auto text-gray-300">
      <h1 className="text-3xl font-extrabold text-gold-400 mb-6 border-b border-gray-700 pb-2 mt-4">
        🔒 سیاست حریم خصوصی شرکت BrainBridge
      </h1>

      <p className="mb-4">
        شرکت <strong>BrainBridge</strong> به حریم خصوصی کاربران خود احترام می‌گذارد و این سند نحوه جمع‌آوری، استفاده و حفاظت از اطلاعات شخصی شما را توضیح می‌دهد.
      </p>

      <h2 className="text-xl font-bold text-yellow-500 mb-3 mt-6">
        ۱. نوع اطلاعات جمع‌آوری‌شده
      </h2>
      <ul className="list-disc pr-6 space-y-2 mb-4">
        <li>
          اطلاعات فنی شناسایی دستگاه برای فعال‌سازی لایسنس (مثل شناسه مادربورد یا CPU)
        </li>
        <li>
          اطلاعات تماس شامل نام شرکت، ایمیل (
          <strong>zabihullahburhani@gmail.com</strong>) و شماره تماس (0705002913)
        </li>
      </ul>

      <h2 className="text-xl font-bold text-yellow-500 mb-3 mt-6">
        ۲. نحوه استفاده از اطلاعات
      </h2>
      <ul className="list-disc pr-6 space-y-2 mb-4">
        <li>تأیید و فعال‌سازی لایسنس نرم‌افزار</li>
        <li>ارائه پشتیبانی فنی و بهبود محصولات</li>
      </ul>

      <h2 className="text-xl font-bold text-yellow-500 mb-3 mt-6">
        ۳. امنیت داده‌ها
      </h2>
      <p className="mb-4">
        ما از آخرین پروتکل‌های امنیتی برای محافظت از داده‌های کاربران در برابر دسترسی غیرمجاز استفاده می‌کنیم.
      </p>
    </div>
  );
}
