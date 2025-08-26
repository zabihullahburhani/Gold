"use client";
import { useState } from "react";

const sampleEmployees = [
  { id: 1, fullName: "علی اکبری", role: "مدیر فروش", phone: "0701111111" },
  { id: 2, fullName: "مریم نادری", role: "حسابدار", phone: "0792222222" },
];

export default function Employees() {
  const [employees, setEmployees] = useState(sampleEmployees);

  const handleDelete = (id: number) => {
    if(confirm("آیا مطمئن هستید می‌خواهید حذف کنید؟")) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">👨‍💼 مدیریت کارمندان</h1>

      <button className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        ➕ افزودن کارمند
      </button>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">نام کامل</th>
              <th className="p-2">سمت</th>
              <th className="p-2">شماره تماس</th>
              <th className="p-2">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id} className="border-t">
                <td className="p-2">{e.id}</td>
                <td className="p-2">{e.fullName}</td>
                <td className="p-2">{e.role}</td>
                <td className="p-2">{e.phone}</td>
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
