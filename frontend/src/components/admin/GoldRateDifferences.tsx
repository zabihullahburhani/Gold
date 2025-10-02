"use client";
import React, { useEffect, useState } from "react";
import {
  fetchGoldRates as apiFetchGoldRates,
  createGoldRate as apiCreateGoldRate,
  deleteGoldRate as apiDeleteGoldRate,
} from "../../services/goldrates_api";
import { Card, CardHeader, CardContent } from "./ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"; // 🚀 اضافه کنید (npm i recharts)

interface GoldRate {
  rate_id: number;
  rate_per_gram_usd: number;
  rate_per_gram_afn: number;
  difference_per_gram_usd: number;
  difference_per_gram_afn: number;
  final_rate_usd: number;
  final_rate_afn: number;
  created_at: string;
}

export default function GoldRates() {
  const [rates, setRates] = useState<GoldRate[]>([]);
  const [newRate, setNewRate] = useState({
    rate_per_gram_usd: 0,
    rate_per_gram_afn: 0,
    difference_per_gram_usd: 0,
    difference_per_gram_afn: 0,
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const loadData = async () => {
    if (!token) return;
    try {
      const data = await apiFetchGoldRates(token);
      setRates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading gold rates:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleCreate = async () => {
    if (!token) return;
    try {
      await apiCreateGoldRate(newRate, token);
      setNewRate({
        rate_per_gram_usd: 0,
        rate_per_gram_afn: 0,
        difference_per_gram_usd: 0,
        difference_per_gram_afn: 0,
      });
      loadData();
    } catch (error) {
      console.error("Failed to create gold rate:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await apiDeleteGoldRate(id, token);
      loadData();
    } catch (error) {
      console.error("Failed to delete gold rate:", error);
    }
  };

  // 🚀 داده برای Pie Chart (برای آخرین نرخ – USD و AFN)
  const lastRate = rates[0]; // آخرین نرخ (جدیدترین)
  const usdData = lastRate ? [
    { name: "نرخ خرید (دالر)", value: lastRate.rate_per_gram_usd },
    { name: "اختلاف (دالر)", value: lastRate.difference_per_gram_usd },
  ] : [];
  const afnData = lastRate ? [
    { name: "نرخ خرید (افغانی)", value: lastRate.rate_per_gram_afn },
    { name: "اختلاف (افغانی)", value: lastRate.difference_per_gram_afn },
  ] : [];
  const COLORS = ["#FFD700", "#FF4500"]; // طلایی برای پایه، نارنجی برای اختلاف

  return (
    <Card className="bg-black text-yellow-400 border border-yellow-500 rounded-xl">
      <CardHeader className="text-base font-bold">
        مدیریت نرخ و اختلاف قیمت طلا
        <p className="text-xs text-gray-400 mt-1">
          اختلاف قیمت = حاشیه سود عمده‌فروش (مارژین). قیمت نهایی = قیمت خرید + اختلاف.
        </p>
      </CardHeader>
      <CardContent>
        {/* فرم افزودن نرخ جدید */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 mb-4 text-sm">
          <div>
            <label className="block mb-1 text-xs">قیمت خرید فی گرام (دالر):</label>
            <input
              type="number"
              placeholder="مثال: 60"
              value={newRate.rate_per_gram_usd}
              onChange={(e) =>
                setNewRate({ ...newRate, rate_per_gram_usd: parseFloat(e.target.value) || 0 })
              }
              className="w-full p-1.5 text-black text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs">قیمت خرید فی گرام (افغانی):</label>
            <input
              type="number"
              placeholder="مثال: 4500"
              value={newRate.rate_per_gram_afn}
              onChange={(e) =>
                setNewRate({ ...newRate, rate_per_gram_afn: parseFloat(e.target.value) || 0 })
              }
              className="w-full p-1.5 text-black text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          {/* فیلدهای اختلاف قیمت */}
          <div>
            <label className="block mb-1 text-xs">اختلاف قیمت فی گرام (دالر):</label>
            <input
              type="number"
              step="0.01"
              placeholder="مثال: 0.5"
              value={newRate.difference_per_gram_usd}
              onChange={(e) =>
                setNewRate({ ...newRate, difference_per_gram_usd: parseFloat(e.target.value) || 0 })
              }
              className="w-full p-1.5 text-black text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs">اختلاف قیمت فی گرام (افغانی):</label>
            <input
              type="number"
              step="1"
              placeholder="مثال: 20"
              value={newRate.difference_per_gram_afn}
              onChange={(e) =>
                setNewRate({ ...newRate, difference_per_gram_afn: parseFloat(e.target.value) || 0 })
              }
              className="w-full p-1.5 text-black text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          <div className="sm:col-span-2 mt-2">
            <button
              onClick={handleCreate}
              className="bg-yellow-500 text-black p-2 rounded w-full hover:bg-yellow-600 transition-colors text-sm"
            >
              ثبت نرخ و اختلاف
            </button>
          </div>
        </div>

        {/* جدول نمایش نرخ‌ها */}
        <div className="overflow-x-auto">
          <table className="w-full mt-4 border border-yellow-500 text-xs">
            <thead className="bg-yellow-600 text-black">
              <tr>
                <th className="px-2 py-1">کد</th>
                <th className="px-2 py-1">نرخ خرید (دالر)</th>
                <th className="px-2 py-1">اختلاف (دالر)</th>
                <th className="px-2 py-1">قیمت نهایی (دالر)</th>
                <th className="px-2 py-1">نرخ خرید (افغانی)</th>
                <th className="px-2 py-1">اختلاف (افغانی)</th>
                <th className="px-2 py-1">قیمت نهایی (افغانی)</th>
                <th className="px-2 py-1">تاریخ</th>
                <th className="px-2 py-1">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rates.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-2 text-center text-gray-400">
                    نرخ طلایی ثبت نشده است.
                  </td>
                </tr>
              )}
              {rates.map((r) => (
                <tr key={r.rate_id} className="border-t border-yellow-500">
                  <td className="px-2 py-1">{r.rate_id}</td>
                  <td className="px-2 py-1">{r.rate_per_gram_usd}</td>
                  <td className="px-2 py-1">{r.difference_per_gram_usd}</td>
                  <td className="px-2 py-1">{r.final_rate_usd}</td>
                  <td className="px-2 py-1">{r.rate_per_gram_afn}</td>
                  <td className="px-2 py-1">{r.difference_per_gram_afn}</td>
                  <td className="px-2 py-1">{r.final_rate_afn}</td>
                  <td className="px-2 py-1">{new Date(r.created_at).toLocaleDateString("fa-IR")}</td>
                  <td className="px-2 py-1">
                    <button
                      onClick={() => handleDelete(r.rate_id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🚀 Pie Chart برای نمایش توزیع (برای آخرین نرخ) */}
        {rates.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pie Chart برای USD */}
            <div>
              <h3 className="text-sm font-bold mb-2">توزیع نرخ دالر (آخرین نرخ)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={usdData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#558aab77"
                    label
                  >
                    {usdData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart برای AFN */}
            <div>
              <h3 className="text-sm font-bold mb-2">توزیع نرخ افغانی (آخرین نرخ)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={afnData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#1309d7ff"
                    label
                  >
                    {afnData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}