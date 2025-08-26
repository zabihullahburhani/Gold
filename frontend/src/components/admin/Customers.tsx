"use client";
import { useState } from "react";

const sampleCustomers = [
  { id: 1, fullName: "احمد احمدی", phone: "0700000000", address: "کابل" },
  { id: 2, fullName: "زهرا حسینی", phone: "0791111111", address: "هرات" },
];

export default function Customers() {
  const [customers, setCustomers] = useState(sampleCustomers);

  const handleDelete = (id: number) => {
    if(confirm("آیا مطمئن هستید می‌خواهید حذف کنید؟")) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">👥 مدیریت مشتریان</h1>

      <button className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        ➕ افزودن مشتری
      </button>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">نام کامل</th>
              <th className="p-2">شماره تماس</th>
              <th className="p-2">آدرس</th>
              <th className="p-2">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.id}</td>
                <td className="p-2">{c.fullName}</td>
                <td className="p-2">{c.phone}</td>
                <td className="p-2">{c.address}</td>
                <td className="p-2 space-x-2">
                  <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">ویرایش</button>
                  <button onClick={() => handleDelete(c.id)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
