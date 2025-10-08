"use client";
import React from "react";

export default function AboutPage() {
  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl min-h-[70vh] w-full max-w-4xl mx-auto text-gray-300">
      <h1 className="text-3xl font-extrabold text-gold-400 mb-6 border-b border-gray-700 pb-2 mt-4">
        ℹ️ درباره شرکت BrainBridge
      </h1>

      <p className="mb-4">
        <strong>BrainBridge</strong> یک شرکت پیشرو در زمینه توسعه راهکارهای نرم‌افزاری با تمرکز بر آخرین تکنولوژی‌های روز دنیا است. ما متعهد به ساخت برنامه‌های تحت وب، دسکتاپ و موبایل با بالاترین استانداردهای کیفیت و امنیت هستیم.
      </p>

      <h2 className="text-xl font-bold text-yellow-500 mb-3 mt-6">
        تخصص و توانمندی‌ها
      </h2>
      <p className="mb-4">
        ما بر این باوریم که نوآوری و کیفیت، ستون‌های اصلی موفقیت هستند. تیم ما متشکل از متخصصان مجرب و متعهدی است که با استفاده از دانش عمیق و به‌روز خود، هر پروژه را به یک دستاورد موفق تبدیل می‌کنند.
      </p>

      <ul className="list-disc pr-6 space-y-2 mb-4">
        <li>تیم مجرب و حرفه‌ای برای توسعه نرم‌افزارهای مدرن</li>
        <li>آزمایشگاه SCNA جهت ارزیابی عملکرد محصولات قبل از عرضه</li>
      </ul>

      <h2 className="text-xl font-bold text-yellow-500 mb-3 mt-6">
        تماس با ما
      </h2>
      <p className="mb-2">📧 ایمیل: zabihullahburhani@gmail.com</p>
      <p>📞 شماره تماس: 0705002913</p>
    </div>
  );
}
