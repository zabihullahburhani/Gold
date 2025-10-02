// frontend/src/components/admin/Activations.tsx
"use client";

import React, { useEffect, useState } from "react";
// فرض بر این است که Card/CardHeader/CardContent از این مسیر قابل دسترسی است
import { Card, CardHeader, CardContent } from "./ui/card"; 
import {
  fetchActivations,
  createActivationRequest,
  activateCode,
  detectHardware,
} from "../../services/app_activations_api";

// ⚠️ این اینترفیس باید با ActivationOut در schemas/activation.py بک‌اند هماهنگ باشد
interface Activation {
  activation_id: number;
  motherboard_code: string;
  cpu_code: string;
  hdd_code: string;
  mac_code: string;
  activation_code: string | null; 
  is_active: boolean;
  expiration_date: string | null;
  created_at: string;
}

export default function Activations() {
  const [activations, setActivations] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState<string>("");
  const [selectedMb, setSelectedMb] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      // 🎯 فراخوانی Endpoint جدید GET /activations
      const data = await fetchActivations();
      setActivations(data || []);
    } catch (err) {
      console.error("Failed to load activations:", err);
      alert("خطا در بارگذاری لیست فعال‌سازی‌ها. مطمئن شوید سرور پایتون فعال است.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestActivation = async (mbCode: string) => {
    try {
      await createActivationRequest({
        motherboard_code: mbCode,
        cpu_code: "CPU-DEMO",
        hdd_code: "HDD-DEMO",
        mac_code: "MAC-DEMO",
      });
      await loadData();
      alert(`درخواست فعال‌سازی (ID: ${mbCode}) ارسال شد.`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "خطا در ارسال درخواست فعال‌سازی.");
    }
  };

  // 🎯 تابع فعال‌سازی نهایی
  const handleActivateCode = async () => {
    if (!selectedMb || !newCode) return;
    try {
      // استفاده از activateCode که رکورد را در دیتابیس پیدا کرده و فعال می‌کند
      await activateCode(selectedMb, newCode); 
      await loadData();
      setNewCode("");
      setSelectedMb("");
      alert("فعال‌سازی با موفقیت انجام شد و تاریخ انقضا تنظیم گردید!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "کد فعال‌سازی اشتباه است یا خطا رخ داده.");
    }
  };
  
  const formatExpireDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR'); 
    } catch {
      return "-";
    }
  };


  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen text-white font-inter">
      <Card className="rounded-xl bg-gray-800 border border-teal-700 shadow-xl">
        <CardHeader className="text-xl font-bold border-b border-gray-700 pb-3">
          💻 مدیریت فعال‌سازی برنامه (پنل ادمین)
        </CardHeader>
        <CardContent className="pt-4">
          
          {/* بخش شبیه سازی ارسال درخواست */}
          <h3 className="mb-2 text-teal-400 font-semibold">سخت‌افزارهای شناسایی شده (تست):</h3>
          <div className="flex flex-col gap-2 mb-6">
            {detectHardware().map((mb) => (
              <div
                key={mb}
                className="flex justify-between items-center bg-gray-700 p-2 rounded"
              >
                <span className="font-mono text-yellow-400">{mb}</span>
                <button
                  onClick={() => handleRequestActivation(mb)}
                  className="bg-teal-600 px-3 py-1 rounded hover:bg-teal-700 text-sm"
                >
                  ارسال درخواست فعال‌سازی
                </button>
              </div>
            ))}
          </div>

          {/* بخش لیست فعال‌سازی‌ها */}
          <h3 className="mb-2 text-teal-400 font-semibold">لیست فعال‌سازی‌ها:</h3>
          {loading ? (
            <p className="text-gray-500">در حال بارگیری...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="p-2 border border-gray-600">ID</th>
                    <th className="p-2 border border-gray-600">M/B Code</th>
                    <th className="p-2 border border-gray-600">کد ادمین</th>
                    <th className="p-2 border border-gray-600">فعال شده؟</th>
                    <th className="p-2 border border-gray-600">انقضا</th>
                    <th className="p-2 border border-gray-600">ثبت اولیه</th>
                  </tr>
                </thead>
                <tbody>
                  {activations.map((act) => {
                    const isExpired = act.is_active && act.expiration_date && new Date(act.expiration_date).getTime() < Date.now();
                    const statusClass = act.is_active && !isExpired ? 'text-green-400' : (isExpired ? 'text-orange-400' : 'text-red-400');

                    return (
                    <tr key={act.activation_id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                      <td className="p-2">{act.activation_id}</td>
                      <td className="p-2 font-mono break-words text-yellow-500">{act.motherboard_code}</td>
                      <td className="p-2 font-mono break-words text-gray-300">{act.activation_code || "-"}</td>
                      <td className={`p-2 font-bold ${statusClass}`}>
                        {act.is_active && !isExpired ? "✅ فعال" : (isExpired ? "⚠️ منقضی" : "❌ غیرفعال")}
                      </td>
                      <td className="p-2 text-gray-400">{formatExpireDate(act.expiration_date)}</td>
                      <td className="p-2 text-gray-500">{new Date(act.created_at).toLocaleDateString('fa-IR')}</td>
                    </tr>
                  )}
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* بخش ثبت کد فعال‌سازی */}
          <div className="mt-6 space-y-2 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-teal-400 mb-1 font-semibold">ثبت کد فعال‌سازی و فعال‌سازی (توسط ادمین/مشتری):</h3>
            <select
              className="w-full p-2 rounded bg-gray-600 text-white border-none focus:ring-2 focus:ring-teal-500"
              value={selectedMb}
              onChange={(e) => setSelectedMb(e.target.value)}
            >
              <option value="">-- یک سخت‌افزار ثبت شده را انتخاب کنید --</option>
              {activations.map(
                (act) =>
                  <option key={act.activation_id} value={act.motherboard_code}>
                    {act.motherboard_code} ({act.is_active ? (new Date(act.expiration_date!).getTime() < Date.now() ? 'منقضی' : 'فعال') : 'غیرفعال'})
                  </option>
              )}
            </select>
            <input
              type="text"
              placeholder="کد فعال‌سازی"
              className="w-full p-2 rounded bg-gray-600 text-white border-none focus:ring-2 focus:ring-teal-500"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
            <button
              onClick={handleActivateCode}
              disabled={!selectedMb || !newCode || loading}
              className="bg-teal-600 px-4 py-2 rounded hover:bg-teal-700 w-full font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              فعال‌سازی
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}