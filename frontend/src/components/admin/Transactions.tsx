"use client";
import { useState } from "react";

const sampleTransactions = [
  { id: 1, customer: "احمد احمدی", employee: "علی اکبری", goldType: "24 عیار", grams: 10, totalUSD: 600, date: "2025-08-26" },
  { id: 2, customer: "زهرا حسینی", employee: "مریم نادری", goldType: "18 عیار", grams: 5, totalUSD: 225, date: "2025-08-26" },
];

export default function Transactions() {
  const [transactions, setTransactions] = useState(sampleTransactions);

  const handleDelete = (id: number) => {
    if(confirm("آیا مطمئن هستید می‌خواهید حذف کنید؟")) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🧾 مدیریت تراکنش‌ها</h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">مشتری</th>
              <th className="p-2">کارمند</th>
              <th className="p-2">نوع طلا</th>
              <th className="p-2">گرم</th>
              <th className="p-2">مجموع USD</th>
              <th className="p-2">تاریخ</th>
              <th className="p-2">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{t.id}</td>
                <td className="p-2">{t.customer}</td>
                <td className="p-2">{t.employee}</td>
                <td className="p-2">{t.goldType}</td>
                <td className="p-2">{t.grams}</td>
                <td className="p-2">{t.totalUSD}</td>
                <td className="p-2">{t.date}</td>
                <td className="p-2 space-x-2">
                  <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">ویرایش</button>
                  <button onClick={() => handleDelete(t.id)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
