"use client";
export default function Reports() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📊 گزارش‌ها</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          💰 گزارش فروش ماهانه (نمونه داده)
        </div>
        <div className="bg-white p-4 rounded shadow">
          📈 نمودار تغییرات قیمت طلا
        </div>
      </div>
    </div>
  );
}
