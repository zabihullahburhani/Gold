"use client";
import React, { useState } from "react";

export default function TransactionsForm() {
  const [customerId, setCustomerId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [goldTypeId, setGoldTypeId] = useState("");
  const [grams, setGrams] = useState("");
  const [ratePerGram, setRatePerGram] = useState("");
  const [totalUsd, setTotalUsd] = useState("");
  const [txnDate, setTxnDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ customerId, employeeId, goldTypeId, grams, ratePerGram, totalUsd, txnDate, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-lg font-bold mb-4">ثبت تراکنش</h2>
      <input type="text" placeholder="شناسه مشتری" value={customerId} onChange={e=>setCustomerId(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" required />
      <input type="text" placeholder="شناسه کارمند" value={employeeId} onChange={e=>setEmployeeId(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" required />
      <input type="text" placeholder="شناسه نوع طلا" value={goldTypeId} onChange={e=>setGoldTypeId(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" required />
      <input type="number" placeholder="گرم" value={grams} onChange={e=>setGrams(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" required />
      <input type="number" placeholder="نرخ هر گرم" value={ratePerGram} onChange={e=>setRatePerGram(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" required />
      <input type="number" placeholder="جمع کل (USD)" value={totalUsd} onChange={e=>setTotalUsd(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" required />
      <input type="date" value={txnDate} onChange={e=>setTxnDate(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" required />
      <textarea placeholder="یادداشت" value={notes} onChange={e=>setNotes(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" />
      <button type="submit" className="w-full bg-gold-400 text-darkbg py-2 rounded hover:bg-yellow-500 transition-colors">
        ذخیره
      </button>
    </form>
  );
}
