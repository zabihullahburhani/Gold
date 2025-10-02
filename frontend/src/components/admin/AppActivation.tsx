// frontend/src/components/admin/Activations.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import {
  fetchActivations,
  createActivationRequest,
  activateCode,
  getActivationStatus,
} from "../../services/app_activations_api";

interface Activation {
  activation_id: number;
  motherboard_code: string;
  cpu_code: string;
  hdd_code: string;
  mac_code: string;
  activation_code?: string;
  is_active: boolean;
  expiration_date?: string;
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
      const data = await fetchActivations();
      setActivations(data || []);
    } catch (err) {
      console.error("Failed to load activations:", err);
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
      alert("درخواست فعال‌سازی ارسال شد. منتظر دریافت کد از پشتیبان باشید.");
    } catch (err) {
      console.error(err);
      alert("خطا در ارسال درخواست فعال‌سازی.");
    }
  };

  const handleActivateCode = async () => {
    if (!selectedMb || !newCode) return;
    try {
      await activateCode(selectedMb, newCode);
      await loadData();
      setNewCode("");
      setSelectedMb("");
      alert("فعال‌سازی با موفقیت انجام شد!");
    } catch (err) {
      console.error(err);
      alert("کد فعال‌سازی اشتباه است یا خطا رخ داده.");
    }
  };

  const detectHardware = () => {
    // در عمل باید از IPC یا API داخلی سیستم گرفته شود
    return ["MB-123-EXAMPLE"];
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen text-white font-inter">
      <Card className="rounded-xl bg-gray-800 border border-teal-700 shadow-xl">
        <CardHeader>💻 مدیریت فعال‌سازی برنامه</CardHeader>
        <CardContent>
          <h3 className="mb-2 text-teal-400">سخت‌افزارهای شناسایی شده:</h3>
          <div className="flex flex-col gap-2 mb-4">
            {detectHardware().map((mb) => (
              <div
                key={mb}
                className="flex justify-between items-center bg-gray-700 p-2 rounded"
              >
                <span>{mb}</span>
                <button
                  onClick={() => handleRequestActivation(mb)}
                  className="bg-teal-600 px-3 py-1 rounded hover:bg-teal-700"
                >
                  ارسال درخواست فعال‌سازی
                </button>
              </div>
            ))}
          </div>

          <h3 className="mb-2 text-teal-400">لیست فعال‌سازی‌ها:</h3>
          {loading ? (
            <p>در حال بارگیری...</p>
          ) : (
            <table className="w-full text-sm border border-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Motherboard</th>
                  <th className="p-2 border">CPU</th>
                  <th className="p-2 border">HDD</th>
                  <th className="p-2 border">MAC</th>
                  <th className="p-2 border">کد فعال‌سازی</th>
                  <th className="p-2 border">فعال شده؟</th>
                  <th className="p-2 border">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {activations.map((act) => (
                  <tr
                    key={act.activation_id}
                    className="border-b border-gray-700"
                  >
                    <td className="p-2">{act.activation_id}</td>
                    <td className="p-2">{act.motherboard_code}</td>
                    <td className="p-2">{act.cpu_code}</td>
                    <td className="p-2">{act.hdd_code}</td>
                    <td className="p-2">{act.mac_code}</td>
                    <td className="p-2">{act.activation_code || "-"}</td>
                    <td className="p-2">
                      {act.is_active ? "✅ فعال" : "❌ غیرفعال"}
                    </td>
                    <td className="p-2">
                      {new Date(act.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-4 space-y-2">
            <h3 className="text-teal-400 mb-1">ثبت کد فعال‌سازی دریافتی:</h3>
            <select
              className="w-full p-2 rounded bg-gray-700 text-white"
              value={selectedMb}
              onChange={(e) => setSelectedMb(e.target.value)}
            >
              <option value="">یک Motherboard انتخاب کنید</option>
              {activations.map(
                (act) =>
                  !act.is_active && (
                    <option
                      key={act.activation_id}
                      value={act.motherboard_code}
                    >
                      {act.motherboard_code}
                    </option>
                  )
              )}
            </select>
            <input
              type="text"
              placeholder="کد فعال‌سازی"
              className="w-full p-2 rounded bg-gray-700 text-white"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
            <button
              onClick={handleActivateCode}
              className="bg-teal-600 px-4 py-2 rounded hover:bg-teal-700 w-full"
            >
              فعال‌سازی
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
