
"use client";
import React from "react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-950 text-gold-400 p-6 mt-auto border-t border-gray-700 shadow-inner">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* 1. بخش کپی‌رایت و سازنده */}
                <div className="flex flex-col text-center md:text-right space-y-1">
                    <span className="text-lg font-bold text-yellow-500">
                        شبکه سازنده: BrainBridge@2025
                    </span>
                    <span className="text-sm text-gray-400">
                        تمامی حقوق نرم‌افزار محفوظ است.
                    </span>
                </div>

                {/* 2. بخش لینک‌ها و اطلاعات تماس */}
                <div className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-end gap-x-8 gap-y-3 text-sm">
                    
                    {/* ردیف اول اطلاعات */}
                    <div className="flex gap-x-8 gap-y-3 flex-wrap justify-center">
                        <a href="tel:0705002913" className="hover:text-yellow-500 transition-colors flex items-center">
                            📞 شماره تماس: 0705002913  
                        </a>
                        <a href="https://wa.me/989102454274" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 transition-colors flex items-center">
                            💬 واتساپ: +989102454247
                        </a>
                    </div>
                    
                    {/* ردیف دوم اطلاعات */}
                    <div className="flex gap-x-8 gap-y-3 flex-wrap justify-center">
                        <Link href="/content/about" className="hover:text-yellow-500 transition-colors">
                            ℹ️ درباره ما
                        </Link>
                        <Link href="/content/terms" className="hover:text-yellow-500 transition-colors">
                            📜 قوانین استفاده
                        </Link>
                        <Link href="/content/privacy" className="hover:text-yellow-500 transition-colors">
                            🔒 حریم خصوصی
                        </Link>
                    </div>

                </div>
            </div>
        </footer>
    );
}
