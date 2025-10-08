
"use client";

import React, { useEffect, useState } from "react";
import {
  fetchGoldRates as apiFetchGoldRates,
  createGoldRate as apiCreateGoldRate,
  deleteGoldRate as apiDeleteGoldRate,
} from "../../services/goldrates_api";
import { Card, CardHeader, CardContent } from "./ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const loadData = async () => {
    setLoading(true);
    if (!token) return;
    try {
      const data = await apiFetchGoldRates(token);
      setRates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading gold rates:", error);
    } finally {
      setLoading(false);
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
      alert("ثبت نرخ ناموفق بود.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("آیا از حذف این نرخ مطمئن هستید؟")) return;
    try {
      await apiDeleteGoldRate(id, token);
      loadData();
    } catch (error) {
      console.error("Failed to delete gold rate:", error);
      alert("حذف نرخ ناموفق بود.");
    }
  };

  // داده‌ها برای Pie Chart
  const lastRate = rates[0];
  const usdData = lastRate
    ? [
        { name: "نرخ خرید (دالر)", value: lastRate.rate_per_gram_usd },
        { name: "اختلاف (دالر)", value: lastRate.difference_per_gram_usd },
      ]
    : [];
  const afnData = lastRate
    ? [
        { name: "نرخ خرید (افغانی)", value: lastRate.rate_per_gram_afn },
        { name: "اختلاف (افغانی)", value: lastRate.difference_per_gram_afn },
      ]
    : [];
  const COLORS = ["#FFD700", "#FF4500"]; // طلایی و نارنجی

  return (
    <div className="p-6 space-y-8 bg-gray-900 min-h-screen text-gray-200">
      <Card className="bg-gray-800 border-gray-700 shadow-lg">
        <CardHeader className="text-2xl font-bold text-gold-400">
          مدیریت نرخ و اختلاف قیمت طلا
          <p className="text-sm text-gray-400 mt-2">
            اختلاف قیمت = حاشیه سود عمده‌فروش (مارژین). قیمت نهایی = قیمت خرید + اختلاف.
          </p>
        </CardHeader>
        <CardContent>
          {/* فرم افزودن نرخ جدید */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                قیمت خرید فی گرام (دالر)
              </label>
              <input
                type="number"
                placeholder="مثال: 60"
                value={newRate.rate_per_gram_usd || ""}
                onChange={(e) =>
                  setNewRate({ ...newRate, rate_per_gram_usd: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200 placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                قیمت خرید فی گرام (افغانی)
              </label>
              <input
                type="number"
                placeholder="مثال: 4500"
                value={newRate.rate_per_gram_afn || ""}
                onChange={(e) =>
                  setNewRate({ ...newRate, rate_per_gram_afn: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200 placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                اختلاف قیمت فی گرام (دالر)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="مثال: 0.5"
                value={newRate.difference_per_gram_usd || ""}
                onChange={(e) =>
                  setNewRate({
                    ...newRate,
                    difference_per_gram_usd: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200 placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                اختلاف قیمت فی گرام (افغانی)
              </label>
              <input
                type="number"
                step="1"
                placeholder="مثال: 20"
                value={newRate.difference_per_gram_afn || ""}
                onChange={(e) =>
                  setNewRate({
                    ...newRate,
                    difference_per_gram_afn: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200 placeholder-gray-400"
              />
            </div>
            <div className="lg:col-span-4 text-right">
              <button
                onClick={handleCreate}
                className="bg-yellow-500 text-gray-900 px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors duration-200"
              >
                ثبت نرخ و اختلاف
              </button>
            </div>
          </div>

          {/* جدول نمایش نرخ‌ها */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="text-xl font-semibold text-yellow-500">
              لیست نرخ‌های طلا
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-400 text-center">در حال بارگیری...</p>
              ) : rates.length === 0 ? (
                <p className="text-gray-400 text-center">نرخ طلایی ثبت نشده است.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-700 divide-y divide-gray-700 text-sm">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="p-3 text-sm font-medium text-gray-200 text-right">کد</th>
                        <th className="p-3 text-sm font-medium text-gray-200 text-right">نرخ خرید (دالر)</th>
                        <th className="p-3 text-sm font-medium text-gray-200 text-right">اختلاف (دالر)</th>
                        <th className="p-3 text-sm font-medium text-gray-200 text-right">قیمت نهایی (دالر)</th>
                        <th className="p-3 text-sm font-medium text-gray-200 text-right">نرخ خرید (افغانی)</th>
                        <th className="p-3 text-sm font-medium text-gray-200 text-right">اختلاف (افغانی)</th>
                        <th className="p-3 text-sm font-medium text-gray-200 text-right">قیمت نهایی (افغانی)</th>
                        <th className="p-3 text-sm font-medium text-gray-200 text-right">تاریخ</th>
                        <th className="p-3 text-sm font-medium text-gray-200 text-right">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {rates.map((r) => (
                        <tr key={r.rate_id} className="hover:bg-gray-700 transition-colors duration-200">
                          <td className="p-3 text-gray-300 text-right">{r.rate_id}</td>
                          <td className="p-3 text-gray-300 text-right">{r.rate_per_gram_usd.toFixed(2)}</td>
                          <td className="p-3 text-gray-300 text-right">{r.difference_per_gram_usd.toFixed(2)}</td>
                          <td className="p-3 text-gray-300 text-right">{r.final_rate_usd.toFixed(2)}</td>
                          <td className="p-3 text-gray-300 text-right">{r.rate_per_gram_afn.toFixed(2)}</td>
                          <td className="p-3 text-gray-300 text-right">{r.difference_per_gram_afn.toFixed(2)}</td>
                          <td className="p-3 text-gray-300 text-right">{r.final_rate_afn.toFixed(2)}</td>
                          <td className="p-3 text-gray-300 text-right">
                            {new Date(r.created_at).toLocaleDateString("fa-IR")}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDelete(r.rate_id)}
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

          {/* نمودارهای Pie Chart */}
          {rates.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 shadow-lg mt-8">
              <CardHeader className="text-xl font-semibold text-yellow-500">
                توزیع نرخ‌های طلا (آخرین نرخ)
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pie Chart برای USD */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-300">نرخ دالر</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={usdData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={({ name, value }) => `${name}: ${value.toFixed(2)}`}
                        >
                          {usdData.map((entry, index) => (
                            <Cell key={`cell-usd-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            value.toFixed(2),
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #4B5563",
                            color: "#E5E7EB",
                          }}
                        />
                        <Legend wrapperStyle={{ color: "#E5E7EB" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie Chart برای AFN */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-300">نرخ افغانی</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={afnData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={({ name, value }) => `${name}: ${value.toFixed(2)}`}
                        >
                          {afnData.map((entry, index) => (
                            <Cell key={`cell-afn-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            value.toFixed(2),
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #4B5563",
                            color: "#E5E7EB",
                          }}
                        />
                        <Legend wrapperStyle={{ color: "#E5E7EB" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

