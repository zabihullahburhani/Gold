"use client";
import React, { useState } from "react";

export default function ShopExpensesForm() {
  const [expenseType, setExpenseType] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ expenseType, amount, expenseDate, description, employeeId });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-lg font-bold mb-4">ثبت هزینه فروشگاه</h2>
      <input type="text" placeholder="نوع هزینه" value={expenseType} onChange={e=>setExpenseType(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" required />
      <input type="number" placeholder="مبلغ" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" required />
      <input type="date" placeholder="تاریخ" value={expenseDate} onChange={e=>setExpenseDate(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" required />
      <input type="text" placeholder="توضیحات" value={description} onChange={e=>setDescription(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" />
      <input type="text" placeholder="شناسه کارمند" value={employeeId} onChange={e=>setEmployeeId(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 focus:outline-none" required />
      <button type="submit" className="w-full bg-gold-400 text-darkbg py-2 rounded hover:bg-yellow-500 transition-colors">
        ذخیره
      </button>
    </form>
  );
}
