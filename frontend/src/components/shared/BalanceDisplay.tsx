"use client";
import React, { useState } from "react";

export default function ShopBalanceForm() {
  const [goldBalance, setGoldBalance] = useState("");
  const [cashBalance, setCashBalance] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ goldBalance, cashBalance });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-lg font-bold mb-4">ثبت موجودی فروشگاه</h2>
      <input
        type="number"
        placeholder="موجودی طلا (گرم)"
        value={goldBalance}
        onChange={e => setGoldBalance(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none"
        required
      />
      <input
        type="number"
        placeholder="موجودی نقدی (USD)"
        value={cashBalance}
        onChange={e => setCashBalance(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none"
        required
      />
      <button type="submit" className="w-full bg-gold-400 text-darkbg py-2 rounded hover:bg-yellow-500 transition-colors">
        ذخیره
      </button>
      <p> reports using good charts</p>
    </form>
    
  );
}
