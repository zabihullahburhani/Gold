"use client";
import React, { useState } from "react";

export default function GoldRatesForm() {
  const [goldTypeId, setGoldTypeId] = useState("");
  const [ratePerGram, setRatePerGram] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ goldTypeId, ratePerGram, updatedAt });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-lg font-bold mb-4">ثبت نرخ طلا</h2>
      <input
        type="text"
        placeholder="شناسه نوع طلا"
        value={goldTypeId}
        onChange={e => setGoldTypeId(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none"
        required
      />
      <input
        type="number"
        placeholder="نرخ هر گرم"
        value={ratePerGram}
        onChange={e => setRatePerGram(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none"
        required
      />
      <input
        type="date"
        value={updatedAt}
        onChange={e => setUpdatedAt(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none"
      />
      <button type="submit" className="w-full bg-gold-400 text-darkbg py-2 rounded hover:bg-yellow-500 transition-colors">
        ذخیره
      </button>
    </form>
  );
}
