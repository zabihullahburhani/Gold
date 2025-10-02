// frontend/src/components/admin/ShopExpenses.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { fetchExpenses, createExpense, deleteExpense } from "../../services/shop_expenses_api";
import { fetchEmployees } from "../../services/api";    // for user or employee
import { Users } from 'lucide-react';

interface Expense {
  expense_id: number;
  expense_type: string;
  amount: number;
  expense_date: string; // ISO UTC from backend
  expense_date_jalali?: string; // provided by backend
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
    expense_date: new Date().toISOString().slice(0, 19), // ISO-like default
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      // reset
      setForm({
        expense_type: "",
        amount: "",
        expense_date: new Date().toISOString().slice(0,19),
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

  // محاسبه مجموع برای امروز / هفته / ماه
  const computeSummary = (period: "day" | "week" | "month") => {
    const now = new Date();
    const filtered = expenses.filter((ex) => {
      const dt = new Date(ex.expense_date);
      if (period === "day") return dt.toDateString() === now.toDateString();
      if (period === "week") {
        // هفته را با شروع از شنبه محاسبه می‌کنیم (برای فرهنگ فعلی می‌توانید تغییر دهید)
        const start = new Date(now);
        const day = start.getDay(); // 0..6 (Sun..Sat)
        start.setDate(now.getDate() - day);
        start.setHours(0,0,0,0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return dt >= start && dt <= end;
      }
      if (period === "month") return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
      return false;
    });
    const totalAFN = filtered.reduce((s, f) => s + Number(f.amount || 0), 0);
    // تبدیل به USD با نرخ ثابت (قابل تغییر یا گرفتن از یک API) — نمونه نرخ:
    const RATE = 87; // 1 USD = 87 AFN (مثال)
    const totalUSD = totalAFN / RATE;
    return { totalAFN, totalUSD };
  };

  return (
    <div className="p-6 space-y-8 bg-gray-100 min-h-screen">
      <Card>
        <CardHeader>ثبت مصرف دوکان</CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">نوع مصرف</label>
              <input name="expense_type" value={form.expense_type} onChange={handleChange} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">مقدار (AFN)</label>
              <input name="amount" value={form.amount} onChange={handleChange} required type="number" step="0.01" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تاریخ و ساعت (اختیاری)</label>
              <input
                name="expense_date"
                value={form.expense_date}
                onChange={handleChange}
                type="datetime-local"
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">اگر خالی بگذارید، زمان فعلی (افغانستان) ثبت می‌شود.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">کارمند (انتخاب از منو)</label>
              <select name="employee_id" value={form.employee_id} onChange={handleChange} className="w-full p-2 border rounded">
                <option value="">-- انتخاب کارمند --</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>{emp.full_name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">توضیحات</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full p-2 border rounded"></textarea>
            </div>

            <div className="md:col-span-2 text-right">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">ثبت مصرف</button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["day","week","month"] as const).map((p) => {
          const s = computeSummary(p);
          return (
            <div key={p} className="bg-white p-4 rounded shadow text-center">
              <h4 className="font-semibold text-gray-700">{p === "day" ? "امروز" : p === "week" ? "هفته جاری" : "ماه جاری"}</h4>
              <p className="mt-2">مجموع AFN: <strong>{s.totalAFN.toFixed(2)}</strong></p>
              <p>مجموع USD: <strong>{s.totalUSD.toFixed(2)}</strong></p>
            </div>
          )
        })}
      </div>

      <Card>
        <CardHeader>لیست مصارف</CardHeader>
        <CardContent>
          {loading ? (
            <p>در حال بارگیری...</p>
          ) : expenses.length === 0 ? (
            <p>هیچ مصرفی یافت نشد.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 border">#</th>
                    <th className="p-2 border">نوع مصرف</th>
                    <th className="p-2 border">مقدار (AFN)</th>
                    <th className="p-2 border">تاریخ (هجری شمسی)</th>
                    <th className="p-2 border">کارمند</th>
                    <th className="p-2 border">توضیحات</th>
                    <th className="p-2 border">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((ex) => (
                    <tr key={ex.expense_id}>
                      <td className="p-2 border">{ex.expense_id}</td>
                      <td className="p-2 border">{ex.expense_type}</td>
                      <td className="p-2 border">{ex.amount.toFixed(2)}</td>
                      <td className="p-2 border">{ex.expense_date_jalali ?? new Date(ex.expense_date).toLocaleString()}</td>
                      <td className="p-2 border">{ex.employee_id ?? "-"}</td>
                      <td className="p-2 border">{ex.description ?? "-"}</td>
                      <td className="p-2 border">
                        <button onClick={() => handleDelete(ex.expense_id)} className="text-red-500">حذف</button>
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
