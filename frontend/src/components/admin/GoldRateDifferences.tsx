"use client";
import { useState } from "react";

const sampleRateDiffs = [
  { id: 1, goldType: "24 عیار", previousRate: 59, currentRate: 60, difference: 1 },
  { id: 2, goldType: "18 عیار", previousRate: 44, currentRate: 45, difference: 1 },
];

export default function GoldRateDifferences() {
  const [rates, setRates] = useState(sampleRateDiffs);

  const handleDelete = (id: number) => {
    if(confirm("آیا مطمئن هستید می‌خواهید حذف کنید؟")) {
      setRates(rates.filter(r => r.id !== id));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📈 تفاوت نرخ طلا</h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">نوع طلا</th>
              <th className="p-2">نرخ قبلی</th>
              <th className="p-2">نرخ فعلی</th>
              <th className="p-2">تفاوت</th>
              <th className="p-2">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {rates.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.id}</td>
                <td className="p-2">{r.goldType}</td>
                <td className="p-2">{r.previousRate}</td>
                <td className="p-2">{r.currentRate}</td>
                <td className="p-2">{r.difference}</td>
                <td className="p-2 space-x-2">
                  <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">ویرایش</button>
                  <button onClick={() => handleDelete(r.id)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
