"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-black text-gold-400 p-6 mt-auto border-t border-gold-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex flex-col text-center md:text-right">
          <span className="font-semibold">© 2025 GJBMS</span>
          <span>سیستم مدیریت طلا و پاسه – همه حقوق محفوظ است</span>
        </div>
        <div className="flex gap-4 text-sm">
          <a href="#" className="hover:underline"  >درباره ما  </a>
          <a href="#" className="hover:underline" >تماس با ما  </a>
          <a href="#" className="hover:underline">قوانین حریم خصوصی  </a>
        </div>
      </div>
    </footer>
  );
}
