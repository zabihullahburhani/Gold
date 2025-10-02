// frontend/src/components/admin/DownloadReport.tsx
"use client";
import React, { useState } from "react";
import Invoices from "./invoices";

export default function DownloadReport() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/api/v1/reports/full`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
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
      const filename = res.headers.get("Content-Disposition")?.split("filename=")[1] || "report.pdf";
      a.download = filename.replace(/"/g,"");
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
     
      <button onClick={handleDownload} className="bg-yellow-500 text-black px-4 py-2 rounded" disabled={loading}>
        {loading ? "در حال آماده‌سازی..." : "دانلود گزارش جامع (PDF)"}
      </button>


       <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">گزارش‌ها و بل‌ها</h1>
      <Invoices />
    </div>

    </div>


  );
}
