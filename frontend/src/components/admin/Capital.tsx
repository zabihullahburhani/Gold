"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import {
  fetchCapitals,
  createCapital,
  deleteCapital,
} from "../../services/capital_api";

import moment from "moment-jalaali";

interface CapitalRecord {
  id: number;
  usd_capital: number;
  gold_capital: number;
  date: string;
}

export default function CapitalAdmin() {
  const [records, setRecords] = useState<CapitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [usdCapital, setUsdCapital] = useState<number>(0);
  const [goldCapital, setGoldCapital] = useState<number>(0);
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [isSaving, setIsSaving] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCapitals();
      setRecords(data);
    } catch (err) {
      console.error("Error loading capital records:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createCapital({
        usd_capital: usdCapital,
        gold_capital: goldCapital,
        date,
      });
      setUsdCapital(0);
      setGoldCapital(0);
      setDate(new Date().toISOString().slice(0, 10));
      loadRecords();
    } catch (err) {
      console.error("Error creating capital record:", err);
      alert("خطا در ثبت سرمایه.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این رکورد را حذف کنید؟")) return;
    try {
      await deleteCapital(id);
      loadRecords();
    } catch (err) {
      console.error("Error deleting capital record:", err);
      alert("خطا در حذف رکورد.");
    }
  };

  return (
    <div className="p-2 space-y-2 bg-gray-900 text-white min-h-screen font-inter">
      <h1 className="text-2xl font-bold text-teal-400 text-center border-b border-gray-700 pb-1">
        مدیریت سرمایه کل
      </h1>

      {/* فرم ثبت سرمایه */}
      <Card className="bg-gray-800 p-2 shadow-xl border border-teal-700">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-200">ثبت سرمایه جدید</h2>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end"
          >
            <div>
              <label className="block text-xs font-medium mb-0.5 text-gray-400">
                سرمایه دالر
              </label>
              <input
                type="number"
                step="0.01"
                value={usdCapital}
                onChange={(e) => setUsdCapital(parseFloat(e.target.value) || 0)}
                className="w-full p-1 rounded-lg bg-gray-700 border border-gray-600 text-white text-xs text-right"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-0.5 text-gray-400">
                سرمایه طلا (گرم)
              </label>
              <input
                type="number"
                step="0.0001"
                value={goldCapital}
                onChange={(e) => setGoldCapital(parseFloat(e.target.value) || 0)}
                className="w-full p-1 rounded-lg bg-gray-700 border border-gray-600 text-white text-xs text-right"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-0.5 text-gray-400">
                تاریخ
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-1 rounded-lg bg-gray-700 border border-gray-600 text-white text-xs"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-colors disabled:bg-gray-600"
              >
                {isSaving ? "در حال ثبت..." : "ثبت سرمایه"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* جدول سرمایه ها */}
      <Card className="bg-gray-800 p-2 shadow-xl border border-teal-700">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-200">لیست سرمایه ها</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-3 text-teal-400">
              🔄 در حال بارگیری...
            </div>
          ) : records.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700 border-collapse">
                <thead className="bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-1 py-0.5 text-right text-xs font-medium text-gray-300 border-l border-gray-700">
                      شماره
                    </th>
                    <th className="px-1 py-0.5 text-right text-xs font-medium text-gray-300 border-l border-gray-700">
                      تاریخ
                    </th>
                    <th className="px-1 py-0.5 text-right text-xs font-medium text-gray-300 border-l border-gray-700">
                      سرمایه دالر
                    </th>
                    <th className="px-1 py-0.5 text-right text-xs font-medium text-gray-300 border-l border-r-0">
                      سرمایه طلا (گرم)
                    </th>
                    <th className="px-1 py-0.5 text-right text-xs font-medium text-gray-300 border-l border-r-0">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {records.map((r, i) => (
                    <tr key={r.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-1 py-0.5 text-xs text-gray-300 border-b border-gray-700 border-l text-center">
                        {i + 1}
                      </td>
                      <td className="px-1 py-0.5 text-xs text-gray-300 border-b border-gray-700 border-l">
                        {moment(r.date).format("jYYYY/jMM/jDD")}
                      </td>
                      <td className="px-1 py-0.5 text-xs text-gray-300 border-b border-gray-700 border-l text-right">
                        {r.usd_capital.toFixed(2)}
                      </td>
                      <td className="px-1 py-0.5 text-xs text-gray-300 border-b border-gray-700 border-l border-r-0 text-right">
                        {r.gold_capital.toFixed(4)}
                      </td>
                      <td className="px-1 py-0.5 text-xs text-gray-300 border-b border-gray-700 border-l border-r-0 text-center">
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-2">داده‌ای یافت نشد.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
