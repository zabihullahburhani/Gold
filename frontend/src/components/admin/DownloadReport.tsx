// frontend/src/components/admin/DownloadReport.tsx
"use client";
import React, { useState } from "react";
// ⚠️ فرض بر این است که فایل Invoices.tsx در همان دایرکتوری وجود دارد
import Invoices from "./invoices"; 

export default function DownloadReport() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // 🎯 استفاده از endpoint اکسل
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/api/v1/reports/full/excel`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          'Accept': 'text/csv', // درخواست صریح CSV
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server error: ${res.status} ${txt}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // 🎯 منطق دریافت نام فایل از هدر سرور یا ایجاد نام با فرمت درخواستی شما
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const defaultFilename = `report_${today}.csv`;
      
      const headerFilename = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g,"");
      
      // نام فایل دانلود را از هدر می‌گیریم. در غیر این صورت، از نام پیش‌فرض استفاده می‌کنیم.
      const filename = headerFilename || defaultFilename; 
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err:any) {
      console.error("Download failed:", err);
      alert("دانلود گزارش با خطا مواجه شد: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
     
      {/* 🎯 دکمه دانلود CSV */}
      <button 
          onClick={handleDownload} 
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors" 
          disabled={loading}
      >
        {loading ? "در حال آماده‌سازی..." : "📊 دانلود گزارش جامع (CSV/Excel)"}
      </button>

      <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">گزارش‌ها و بل‌ها</h1>
        {/* ⚠️ فرض بر این است که کامپوننت Invoices را از بخش دوم کد شما اینجا استفاده کنیم */}
      <Invoices /> 
    </div>

    </div>
  );
}