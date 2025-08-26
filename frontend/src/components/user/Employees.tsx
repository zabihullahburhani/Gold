"use client";
import React, { useState } from "react";

export default function EmployeesForm() {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ fullName, role, phone });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-lg font-bold mb-4">ثبت کارمند</h2>
      <input type="text" placeholder="نام کامل" value={fullName} onChange={(e)=>setFullName(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" required />
      <input type="text" placeholder="سمت" value={role} onChange={(e)=>setRole(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" required />
      <input type="text" placeholder="شماره تماس" value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" />
      <button type="submit" className="w-full bg-gold-400 text-darkbg py-2 rounded hover:bg-yellow-500 transition-colors">
        ذخیره
      </button>
    </form>
  );
}
