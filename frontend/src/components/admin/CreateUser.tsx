"use client";
import { useState } from "react";

export default function CreateUser() {
  const [full_name, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleCreateUser = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/v1/users/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ username, password, full_name }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ یوزر جدید ساخته شد!");
      setFullName("");
      setUsername("");
      setPassword("");
    } else {
      alert(data.detail || "❌ خطا در ساخت یوزر");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-black">
      <h2 className="text-lg font-bold mb-4">➕ ایجاد یوزر جدید</h2>
      <input
        type="text"
        placeholder="نام کامل"
        value={full_name}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full mb-3 px-3 py-2 border rounded"
      />
      <input
        type="text"
        placeholder="نام کاربری"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full mb-3 px-3 py-2 border rounded"
      />
      <input
        type="password"
        placeholder="رمز عبور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 px-3 py-2 border rounded"
      />
      <button
        onClick={handleCreateUser}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded"
      >
        ثبت کاربر
      </button>
    </div>
  );
}
