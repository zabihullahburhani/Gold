
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { fetchExpenses, createExpense, deleteExpense } from "../../services/shop_expenses_api";
import { fetchEmployees } from "../../services/api";
import { Users } from "lucide-react";

interface Expense {
  expense_id: number;
  expense_type: string;
  amount: number;
  expense_date: string;
  expense_date_jalali?: string;
  description?: string;
  employee_id?: number;
}

interface Employee {
  employee_id: number;
  full_name: string;
}

export default function ShopExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    expense_type: "",
    amount: "",
    expense_date: new Date().toISOString().slice(0, 19),
    description: "",
    employee_id: "",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const loadData = async () => {
    setLoading(true);
    try {
      if (!token) return;
      const [expData, empData] = await Promise.all([
        fetchExpenses(token),
        fetchEmployees(token),
      ]);
      setExpenses(Array.isArray(expData) ? expData : []);
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (err) {
      console.error("Failed to load shop expenses or employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      if (!token) throw new Error("No token");
      await createExpense(token, {
        expense_type: form.expense_type,
        amount: parseFloat(form.amount),
        expense_date: form.expense_date ? new Date(form.expense_date).toISOString() : undefined,
        description: form.description || undefined,
        employee_id: form.employee_id ? Number(form.employee_id) : undefined,
      });
      setForm({
        expense_type: "",
        amount: "",
        expense_date: new Date().toISOString().slice(0, 19),
        description: "",
        employee_id: "",
      });
      await loadData();
    } catch (err) {
      console.error("Failed to create expense:", err);
      alert("ثبت مصرف ناموفق بود.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("آیا از حذف این مصرف مطمئن هستید؟")) return;
    try {
      await deleteExpense(token, id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete expense:", err);
      alert("حذف ناموفق بود.");
    }
  };

  const computeSummary = (period: "day" | "week" | "month") => {
    const now = new Date();
    const filtered = expenses.filter((ex) => {
      const dt = new Date(ex.expense_date);
      if (period === "day") return dt.toDateString() === now.toDateString();
      if (period === "week") {
        const start = new Date(now);
        const day = start.getDay();
        start.setDate(now.getDate() - day);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return dt >= start && dt <= end;
      }
      if (period === "month") return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
      return false;
    });
    const totalAFN = filtered.reduce((s, f) => s + Number(f.amount || 0), 0);
    const RATE = 87;
    const totalUSD = totalAFN / RATE;
    return { totalAFN, totalUSD };
  };

  return (
    <div className="p-6 space-y-8 bg-gray-900 min-h-screen text-gray-200">
      {/* فرم ثبت هزینه */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg">
        <CardHeader className="text-2xl font-bold text-gold-400">
          ثبت مصرف دوکان
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">نوع مصرف</label>
              <input
                name="expense_type"
                value={form.expense_type}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200 placeholder-gray-400"
                placeholder="مثال: اجاره، قبض، خرید"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">مقدار (AFN)</label>
              <input
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
                type="number"
                step="0.01"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200 placeholder-gray-400"
                placeholder="مثال: 1000"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">تاریخ و ساعت (اختیاری)</label>
              <input
                name="expense_date"
                value={form.expense_date}
                onChange={handleChange}
                type="datetime-local"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200"
              />
              <p className="text-xs text-gray-400 mt-1">اگر خالی بگذارید، زمان فعلی (افغانستان) ثبت می‌شود.</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">کارمند (انتخاب از منو)</label>
              <select
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200"
              >
                <option value="">-- انتخاب کارمند --</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-300">توضیحات</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200 placeholder-gray-400"
                placeholder="توضیحات اختیاری"
              />
            </div>
            <div className="md:col-span-2 text-right">
              <button
                type="submit"
                className="bg-yellow-500 text-gray-900 px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors duration-200"
              >
                ثبت مصرف
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* کارت‌های خلاصه */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(["day", "week", "month"] as const).map((p) => {
          const s = computeSummary(p);
          return (
            <Card key={p} className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6 text-center">
                <h4 className="text-lg font-semibold text-yellow-500">
                  {p === "day" ? "امروز" : p === "week" ? "هفته جاری" : "ماه جاری"}
                </h4>
                <p className="mt-2 text-gray-300">
                  مجموع AFN: <strong>{s.totalAFN.toFixed(2)}</strong>
                </p>
                <p className="text-gray-300">
                  مجموع USD: <strong>{s.totalUSD.toFixed(2)}</strong>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* جدول لیست هزینه‌ها */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg">
        <CardHeader className="text-2xl font-bold text-gold-400">
          لیست مصارف
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400 text-center">در حال بارگیری...</p>
          ) : expenses.length === 0 ? (
            <p className="text-gray-400 text-center">هیچ مصرفی یافت نشد.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-700 divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="p-3 text-sm font-medium text-gray-200 text-right">شناسه</th>
                    <th className="p-3 text-sm font-medium text-gray-200 text-right">نوع مصرف</th>
                    <th className="p-3 text-sm font-medium text-gray-200 text-right">مقدار (AFN)</th>
                    <th className="p-3 text-sm font-medium text-gray-200 text-right">تاریخ (هجری شمسی)</th>
                    <th className="p-3 text-sm font-medium text-gray-200 text-right">کارمند</th>
                    <th className="p-3 text-sm font-medium text-gray-200 text-right">توضیحات</th>
                    <th className="p-3 text-sm font-medium text-gray-200 text-right">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {expenses.map((ex) => (
                    <tr key={ex.expense_id} className="hover:bg-gray-700 transition-colors duration-200">
                      <td className="p-3 text-gray-300 text-right">{ex.expense_id}</td>
                      <td className="p-3 text-gray-300 text-right">{ex.expense_type}</td>
                      <td className="p-3 text-gray-300 text-right">{ex.amount.toFixed(2)}</td>
                      <td className="p-3 text-gray-300 text-right">
                        {ex.expense_date_jalali ?? new Date(ex.expense_date).toLocaleString("fa-IR")}
                      </td>
                      <td className="p-3 text-gray-300 text-right">
                        {ex.employee_id
                          ? employees.find((emp) => emp.employee_id === ex.employee_id)?.full_name ?? "-"
                          : "-"}
                      </td>
                      <td className="p-3 text-gray-300 text-right">{ex.description ?? "-"}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDelete(ex.expense_id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
