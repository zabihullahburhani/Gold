"use client";

import { useState } from "react";
import AdminCard from "../../components/admin/AdminCard";
import Dashboard from "../../components/admin/Dashboard";
import Customers from "../../components/admin/Customers";
import Employees from "../../components/admin/Employees";
import GoldPrices from "../../components/admin/GoldPrices";
import Transactions from "../../components/admin/Transactions";
import Reports from "../../components/admin/DownloadReport";
import GoldRateDifferences from "../../components/admin/GoldRateDifferences";
import ShopExpenses from "../../components/admin/ShopExpenses";
import AppActivation from "../../components/admin/AppActivation";
import DatabaseSettings from "../../components/admin/DatabaseSettings";
import Backup from "../../components/admin/backup";
import Logout from "../../components/admin/Logout";
import GoldAdmin from '../../components/admin/LedgerAdmin';
import Notifications from "../../components/admin/Notifications";
import GoldAnalysis from "../../components/admin/GoldAnalysis";
import Capital from "@/components/admin/Capital";

// Map of components with titles and icons
const componentsMap: any = {
  dashboard: { title: "📊 داشبورد", component: Dashboard },
  customers: { title: "👥 مدیریت مشتریان", component: Customers },
  employees: { title: "🏢 مدیریت کارمندان", component: Employees },
  capital: { title: "💰💵 دخل پول و طلا", component: Capital },
  goldledger: { title: "📒 مدیریت روزنامچه", component: GoldAdmin },
  goldprices: { title: "💰 قیمت‌های طلا", component: GoldPrices },
  transactions: { title: "📊 مدیریت معاملات", component: Transactions },
  reports: { title: "📑 گزارش‌ها", component: Reports },
  goldratediff: { title: "📉 اختلاف نرخ طلا", component: GoldRateDifferences },
  gold_analysis: { title: "⚖️ تحلیل طلا", component: GoldAnalysis },
  expenses: { title: "💵 مصارف دوکان", component: ShopExpenses },
  appactivation: { title: "🔑 فعال‌سازی برنامه", component: AppActivation },
  notifications: { title: "🔔 نوتیفیکیشن‌ها", component: Notifications },
  backup: { title: "🔒 بک آپ", component: Backup },
  logout: { title: "🚪 خروج از حساب", component: Logout },
};

export default function AdminPage() {
  const [active, setActive] = useState<string | null>(null);

  if (active) {
    const ActiveComponent = componentsMap[active].component;
    return (
      <div className="p-4 bg-gray-100 min-h-screen">
        <button
          onClick={() => setActive(null)}
          className="mb-4 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition"
        >
          ← بازگشت
        </button>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-2">
            {Object.keys(componentsMap).map((key) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`block w-full p-3 rounded-lg text-right font-semibold transition text-black ${
                  active === key
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-white hover:bg-gray-50 shadow-sm"
                }`}
              >
                {componentsMap[key].title}
              </button>
            ))}
          </div>
          <div className="md:col-span-3 bg-white rounded-lg p-4 shadow-md">
            <ActiveComponent />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(componentsMap).map((key) => (
          <AdminCard key={key} title={componentsMap[key].title} onClick={() => setActive(key)} />
        ))}
      </div>
    </div>
  );
}