"use client";
import React from "react";

export default function TermsPage() {
  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl min-h-[70vh] w-full max-w-4xl mx-auto text-gray-300">
      <h1 className="text-3xl font-extrabold text-gold-400 mb-6 border-b border-gray-700 pb-2 mt-4">
        📜 قوانین استفاده از محصولات BrainBridge
      </h1>

      <p className="mb-4">
        این سند شامل شرایط و ضوابط حاکم بر استفاده شما از نرم‌افزارها و خدمات توسعه داده شده توسط شبکه <strong>BrainBridge</strong> است. با استفاده از خدمات ما، شما موافقت خود را با این قوانین اعلام می‌نمایید.
      </p>

      <h2 className="text-xl font-bold text-yellow-500 mb-3 mt-6">
        ۱. مالکیت معنوی
      </h2>
      <p className="mb-4">
        کلیه حقوق مالکیت معنوی مربوط به نرم‌افزار، کد منبع، طراحی، و محتوای ارائه‌شده توسط BrainBridge متعلق به این شبکه می‌باشد. استفاده غیرمجاز یا کپی‌برداری ممنوع است.
      </p>

      <h2 className="text-xl font-bold text-yellow-500 mb-3 mt-6">
        ۲. استفاده مجاز
      </h2>
      <p className="mb-4">
        استفاده از نرم‌افزار صرفاً برای اهداف داخلی و تجاری مجاز است. هرگونه تلاش برای مهندسی معکوس یا استفاده غیرقانونی از نرم‌افزار ممنوع می‌باشد.
      </p>

      <h2 className="text-xl font-bold text-yellow-500 mb-3 mt-6">
        ۳. به‌روزرسانی‌ها و پشتیبانی
      </h2>
      <p className="mb-4">
        شبکه BrainBridge متعهد به ارائه به‌روزرسانی‌های فنی و امنیتی در فواصل زمانی منظم است.
      </p>

      <h2 className="text-xl font-bold text-yellow-500 mb-3 mt-6">
        ۴. تعهد کاربر
      </h2>
      <ul className="list-disc pr-6 space-y-2 mb-4">
        <li>ارائه اطلاعات صحیح هنگام ثبت‌نام</li>
        <li>عدم آسیب به زیرساخت‌ها یا داده‌های سایر کاربران</li>
      </ul>
    </div>
  );
}
