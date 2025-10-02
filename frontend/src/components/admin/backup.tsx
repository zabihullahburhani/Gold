import React, { useState } from "react";
import axios from "axios";

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
      setMessage("✅ فایل با موفقیت دانلود شد.");
    } catch (error) {
      console.error(error);
      setMessage("❌ خطا در دانلود فایل");
    }
  };

  // 📤 Upload to Google Drive
  const handleUploadDrive = async () => {
    try {
      const response = await axios.post(`${API_URL}/upload_drive`);
      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage("❌ خطا در آپلود به گوگل‌درایو");
    }
  };

  // 📂 Import
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage("❌ خطا در وارد کردن فایل اکسل");
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-xl shadow-md w-96 mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">📦 مدیریت بک‌آپ</h2>

      <button
        onClick={handleExport}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-3 w-full hover:bg-blue-600"
      >
        📥 Export (دانلود بکاپ)
      </button>

      <button
        onClick={handleUploadDrive}
        className="bg-green-500 text-white px-4 py-2 rounded-lg mb-3 w-full hover:bg-green-600"
      >
        📤 Upload to Google Drive
      </button>

      <label className="bg-yellow-500 cursor-pointer text-white px-4 py-2 rounded-lg mb-3 w-full block hover:bg-yellow-600">
        📂 Import from Excel
        <input
          type="file"
          accept=".xlsx"
          onChange={handleImport}
          className="hidden"
        />
      </label>

      {message && (
        <p className="mt-4 text-sm text-gray-700 bg-white p-2 rounded shadow">
          {message}
        </p>
      )}
    </div>
  );
}
