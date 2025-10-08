
"use client";
import React, { useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent } from "./ui/card";

export default function BackupManager() {
  const [message, setMessage] = useState("");
  const API_URL = "http://127.0.0.1:8000/api/v1/backup"; // آدرس بک‌اند

  // 📥 Export
  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_URL}/export`, {
        responseType: "blob",
      });

      // ساخت لینک دانلود
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // نام فایل را از هدر می‌گیرد
      const disposition = response.headers["content-disposition"];
      let filename = "backup.xlsx";
      if (disposition) {
        const match = disposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setMessage("✅ فایل با موفقیت دانلود شد.");
    } catch (error) {
      console.error("خطا در اکسپورت:", error);
      setMessage("❌ خطا در دانلود فایل");
    }
  };

  // 📤 Upload to Google Drive
  const handleUploadDrive = async () => {
    try {
      const response = await axios.post(`${API_URL}/upload_drive`);
      setMessage(response.data.message);
    } catch (error) {
      console.error("خطا در آپلود به گوگل‌درایو:", error);
      setMessage("❌ خطا در آپلود به گوگل‌درایو");
    }
  };

  // 📂 Import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setMessage("❌ هیچ فایلی انتخاب نشده است.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
      // ریست کردن input file
      event.target.value = "";
    } catch (error) {
      console.error("خطا در ایمپورت:", error);
      setMessage("❌ خطا در وارد کردن فایل اکسل");
    }
  };

  return (
    <Card className="text-black bg-white border-gray-300 rounded-lg shadow-md max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-xl font-bold text-center text-teal-600">📦 مدیریت بک‌آپ</h2>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <button
          onClick={handleExport}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg w-full hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>📥</span> اکسپورت (دانلود بکاپ)
        </button>

        <button
          onClick={handleUploadDrive}
          className="bg-green-600 text-white px-4 py-2 rounded-lg w-full hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>📤</span> آپلود به گوگل‌درایو
        </button>

        <label className="bg-yellow-600 cursor-pointer text-white px-4 py-2 rounded-lg w-full block hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2">
          <span>📂</span> ایمپورت از اکسل
          <input
            type="file"
            accept=".xlsx"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        {message && (
          <p className="mt-4 text-sm text-gray-800 bg-gray-100 p-2 rounded shadow text-center">
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
