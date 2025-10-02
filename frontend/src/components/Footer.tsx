"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-black text-gold-400 p-6 mt-auto border-t border-gold-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* بخش کپی‌رایت */}
        <div className="flex flex-col text-center md:text-right">
          <span className="font-semibold">© 2025 BrainBridge</span>
          <span>سیستم مدیریت – همه حقوق محفوظ است</span>
        </div>

        {/* بخش لینک‌ها و اطلاعات */}
        <div className="text-sm">
          <table className="border-collapse border-0">
            <tbody>
              <tr className="space-x-6">
                <td className="px-4 py-2">
                  <a href="#" className="hover:underline">📞 شماره تماس: 0705002913</a>
                </td>
                <td className="px-4 py-2">
                  <a href="https://wa.me/989102454274" className="hover:underline">💬 واتساپ: +989102454274</a>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  <a href="#" className="hover:underline">ℹ️ درباره ما: شرکت BrainBridge</a>
                </td>
                <td className="px-4 py-2">
                  <a href="#" className="hover:underline">📜 قوانین</a>
                </td>
                <td className="px-4 py-2">
                  <a href="#" className="hover:underline">🔒 حریم خصوصی</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </footer>
  );
}
