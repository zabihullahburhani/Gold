"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchGoldAnalysis, createGoldAnalysis, deleteGoldAnalysis } from "../../services/gold_analysis_api";

// --- ثابت‌ها ---
const STANDARD_CARAT = 23.88;
const TOLA_WEIGHT = 12.15;

// --- واسط‌ها ---
interface GoldAnalysis {
  id: number;
  gross_weight: number;
  initial_purity: number;
  tola_rate: number;
  final_weight: number;
  usd_rate: number;
  analysis_date: string;
  created_at?: string; // اختیاری، هماهنگ با جدول دیتابیس
}

interface FormState {
  gross_weight: number;
  initial_purity: number;
  tola_rate: number;
}

// --- کامپوننت‌های کمکی UI ---
const Card = ({ children, className }: any) => <div className={`border rounded-xl ${className}`}>{children}</div>;
const CardHeader = ({ children }: any) => <div className="p-1 border-b border-gray-700">{children}</div>;
const CardContent = ({ children }: any) => <div className="p-2">{children}</div>;

export default function GoldAnalysisAdmin() {
  const [data, setData] = useState<GoldAnalysis[]>([]);
  const [form, setForm] = useState<FormState>({ gross_weight: 0, initial_purity: 0, tola_rate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // توکن احراز هویت (باید از سیستم احراز هویت شما گرفته شود)
  const token = "YOUR_AUTH_TOKEN_HERE"; // جایگزین با توکن واقعی، مثلاً از localStorage یا Context

  // ---ワクشی داده‌ها ---
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchGoldAnalysis(token);
      console.log("Fetched result:", result); // لاگ برای دیباگ
      setData(result);
    } catch (e: any) {
      console.error("Failed to fetch data:", e);
      setError(`خطا در بارگیری داده‌ها: ${e.message}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- منطق محاسبات فرم ---
  const final_weight = useMemo(() => {
    if (form.gross_weight > 0 && form.initial_purity > 0) {
      return (form.gross_weight * form.initial_purity) / STANDARD_CARAT;
    }
    return 0;
  }, [form.gross_weight, form.initial_purity]);

  const usd_rate = useMemo(() => {
    if (final_weight > 0 && form.tola_rate > 0) {
      return (final_weight / TOLA_WEIGHT) * form.tola_rate;
    }
    return 0;
  }, [final_weight, form.tola_rate]);

  // --- هندلرها ---
  const handleCreate = async () => {
    if (usd_rate === 0) {
      alert("لطفاً فیلدهای ورودی را به درستی پر کنید.");
      return;
    }

    const newAnalysis = {
      gross_weight: form.gross_weight,
      initial_purity: form.initial_purity,
      tola_rate: form.tola_rate,
    };

    try {
      const result = await createGoldAnalysis(token, newAnalysis);
      if (result) {
        loadData();
        setForm({ gross_weight: 0, initial_purity: 0, tola_rate: 0 });
      } else {
        alert("خطا در ثبت تحلیل.");
      }
    } catch (e: any) {
      console.error("Error creating analysis:", e);
      alert(`خطا در ثبت تحلیل: ${e.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا مطمئن هستید؟")) return;
    try {
      const success = await deleteGoldAnalysis(token, id);
      if (success) {
        loadData();
      } else {
        alert("خطا در حذف رکورد.");
      }
    } catch (e: any) {
      console.error("Error deleting analysis:", e);
      alert(`خطا در حذف رکورد: ${e.message}`);
    }
  };

  // --- محاسبات مجموع ---
  const totals = useMemo(() => {
    return data.reduce(
      (acc, row) => {
        acc.totalGrossWeight += row.gross_weight;
        acc.totalFinalWeight += row.final_weight;
        acc.totalUsdRate += row.usd_rate;
        return acc;
      },
      { totalGrossWeight: 0, totalFinalWeight: 0, totalUsdRate: 0 }
    );
  }, [data]);

  // --- کلاس‌های UI ---
  const baseClasses = "px-1 py-0.5 text-xs text-gray-300 border-b border-gray-700 border-l whitespace-nowrap text-right";
  const headerClasses = "px-1 py-0.5 text-right text-xs font-medium text-gray-300 border-l border-gray-700";

  return (
    <div className="p-2 space-y-2 bg-gray-900 text-white min-h-screen font-inter">
      <h1 className="text-2xl font-bold text-teal-400 text-center border-b border-gray-700 pb-1">⚖️ جدول تحلیل طلا</h1>

      {/* فرم افزودن */}
      <Card className="bg-gray-800 p-2 shadow-xl border border-teal-700">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-200">ثبت تحلیل جدید</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-1 items-end">
            <div>
              <label className="block text-xs font-medium mb-0.5 text-gray-400">وزن خالص (گرم)</label>
              <input
                type="number"
                step="0.0001"
                placeholder="وزن خالص"
                value={form.gross_weight || ""}
                onChange={(e) => setForm({ ...form, gross_weight: parseFloat(e.target.value) || 0 })}
                className="w-full p-0.5 rounded-lg bg-gray-700 border border-gray-600 text-white text-xs text-right"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-0.5 text-gray-400">عیار مبدا</label>
              <input
                type="number"
                step="0.01"
                placeholder="عیار مبدا"
                value={form.initial_purity || ""}
                onChange={(e) => setForm({ ...form, initial_purity: parseFloat(e.target.value) || 0 })}
                className="w-full p-0.5 rounded-lg bg-gray-700 border border-gray-600 text-white text-xs text-right"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-0.5 text-gray-400">نرخ توله ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="نرخ توله"
                value={form.tola_rate || ""}
                onChange={(e) => setForm({ ...form, tola_rate: parseFloat(e.target.value) || 0 })}
                className="w-full p-0.5 rounded-lg bg-gray-700 border border-gray-600 text-white text-xs text-right"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-0.5 text-gray-400">عیار مقصد ({STANDARD_CARAT})</label>
              <input
                type="text"
                value={final_weight.toFixed(4)}
                readOnly
                className="w-full p-0.5 rounded-lg bg-gray-600 border border-gray-500 text-xs font-bold text-yellow-300 text-right"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-0.5 text-gray-400">نرخ به دالر ($)</label>
              <input
                type="text"
                value={usd_rate.toFixed(2)}
                readOnly
                className="w-full p-0.5 rounded-lg bg-gray-600 border border-gray-500 text-xs font-bold text-teal-300 text-right"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={usd_rate === 0}
              className="w-full py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-colors md:col-span-1 mt-1 md:mt-0"
            >
              + ثبت
            </button>
          </div>
        </CardContent>
      </Card>

      {/* بخش فیلترینگ تاریخ حذف شده برای ساده‌سازی مشابه نمونه موفق */}
      {/* جدول نمایش تحلیل‌ها */}
      <Card className="bg-gray-800 p-2 shadow-xl border border-teal-700">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-200">سابقه تحلیل‌ها</h2>
        </CardHeader>
        <CardContent>
          {error && <p className="text-center text-red-400 py-2">{error}</p>}
          {loading ? (
            <div className="flex justify-center items-center py-3 text-teal-400">🔄 در حال بارگیری...</div>
          ) : data.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700 border-collapse">
                <thead className="bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className={headerClasses + " text-center"}>شماره</th>
                    <th className={headerClasses}>تاریخ تحلیل</th>
                    <th className={headerClasses}>وزن خالص (گرم)</th>
                    <th className={headerClasses}>عیار مبدا</th>
                    <th className={headerClasses}>نرخ توله ($)</th>
                    <th className={headerClasses}>عیار مقصد (23.88)</th>
                    <th className={headerClasses}>نرخ به دالر ($)</th>
                    <th className={headerClasses + " border-r-0 text-center"}>عملیات</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {data.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-700 transition-colors">
                      <td className={baseClasses + " text-center"}>{row.id}</td>
                      <td className={baseClasses}>{row.analysis_date}</td>
                      <td className={baseClasses}>{row.gross_weight.toFixed(4)}</td>
                      <td className={baseClasses}>{row.initial_purity.toFixed(3)}</td>
                      <td className={baseClasses}>{row.tola_rate.toFixed(2)}</td>
                      <td className={baseClasses + " text-yellow-300 font-bold"}>{row.final_weight.toFixed(3)}</td>
                      <td className={baseClasses + " text-teal-300 font-bold"}>$ {row.usd_rate.toFixed(2)}</td>
                      <td className={baseClasses + " border-r-0 text-center"}>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="bg-red-600 text-white px-1 py-0.5 rounded-md text-xs hover:bg-red-700"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-700 font-bold text-sm">
                    <td className={baseClasses + " text-center"}>TOTAL</td>
                    <td className={baseClasses}></td>
                    <td className={baseClasses + " text-red-300"}>{totals.totalGrossWeight.toFixed(4)}</td>
                    <td className={baseClasses}></td>
                    <td className={baseClasses}></td>
                    <td className={baseClasses + " text-yellow-300"}>{totals.totalFinalWeight.toFixed(3)}</td>
                    <td className={baseClasses + " text-teal-300"}>$ {totals.totalUsdRate.toFixed(2)}</td>
                    <td className={baseClasses + " border-r-0"}></td>
                  </tr>
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