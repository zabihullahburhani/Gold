"use client";
import { useState } from "react";

const sampleExpenses = [
  { id: 1, type: "اجاره مغازه", amount: 500, date: "2025-08-01", employee: "علی اکبری" },
  { id: 2, type: "برق و آب", amount: 120, date: "2025-08-05", employee: "مریم نادری" },
];

export default function ShopExpenses() {
  const [expenses, setExpenses] = useState(sampleExpenses);

  const handleDelete = (id: number) => {
    if(confirm("آیا مطمئن هستید می‌خواهید حذف کنید؟")) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">💸 مدیریت هزینه‌های فروشگاه</h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">نوع هزینه</th>
              <th className="p-2">مبلغ (USD)</th>
              <th className="p-2">تاریخ</th>
              <th className="p-2">کارمند ثبت‌کننده</th>
              <th className="p-2">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id} className="border-t">
                <td className="p-2">{e.id}</td>
                <td className="p-2">{e.type}</td>
                <td className="p-2">{e.amount}</td>
                <td className="p-2">{e.date}</td>
                <td className="p-2">{e.employee}</td>
                <td className="p-2 space-x-2">
                  <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">ویرایش</button>
                  <button onClick={() => handleDelete(e.id)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
