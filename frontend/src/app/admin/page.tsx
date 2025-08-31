// frontend/src/app/admin/page.tsx
// This is the main admin page with cards for different sections.
// Added CreateUser to the map for employee management.
// Created by: Professor Zabihullah Burhani
// ICT and AI and Robotics Specialist
// Phone: 0705002913, Email: zabihullahburhani@gmail.com
// Address: Takhar University, Computer Science Faculty.

"use client";

import { useState } from "react";
import AdminCard from "../../components/admin/AdminCard";
import Dashboard from "../../components/admin/Dashboard";
import Customers from "../../components/admin/Customers";
import Employees from "../../components/admin/Employees";
import GoldPrices from "../../components/admin/GoldPrices";
import Transactions from "../../components/admin/Transactions";
import Reports from "../../components/admin/Reports";
import GoldRateDifferences from "../../components/admin/GoldRateDifferences";
import ShopExpenses from "../../components/admin/ShopExpenses";
import AppActivation from "../../components/admin/AppActivation";
import DatabaseSettings from "../../components/admin/DatabaseSettings";
import Settings from "../../components/admin/Settings";
import Logout from "../../components/admin/Logout";
import Debts from '../../components/admin/Debt';
import Notifications from "@/components/admin/Notifications";

// Map of components with titles and icons
const componentsMap: any = {
  dashboard: { title: "📊 داشبورد", component: Dashboard },
  customers: { title: "👥 مدیریت مشتریان", component: Customers },
  employees: { title: "🏢 مدیریت کارمندان", component: Employees },
  debts: { title: "💳 مدیریت بدهی‌ها", component: Debts },
  goldprices: { title: "💰 قیمت‌های طلا", component: GoldPrices },
  transactions: { title: "📊 مدیریت تراکنش‌ها", component: Transactions },
  reports: { title: "📑 گزارش‌ها", component: Reports },
  goldratediff: { title: "📉 اختلاف نرخ طلا", component: GoldRateDifferences },
  expenses: { title: "💵 مصارف دوکان", component: ShopExpenses },
  appactivation: { title: "🔑 فعال‌سازی برنامه", component: AppActivation },
  dbsettings: { title: "🗄 تنظیمات  دیتابیس", component: DatabaseSettings },
  settings: { title: "⚙️ تنظیمات کلی", component: Settings },
  notifications: { title: "🔔 نوتیفیکیشن‌ها", component: Notifications },
  logout: { title: "🚪 خروج از حساب", component: Logout },
};


export default function AdminPage() {
  const [active, setActive] = useState<string | null>(null);

  if (active) {
    const ActiveComponent = componentsMap[active].component;
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <button
          onClick={() => setActive(null)}
          className="mb-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg shadow"
        >
          ← بازگشت
        </button>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1 space-y-2">
            {Object.keys(componentsMap).map((key) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`block w-[170px] p-3 rounded-lg text-right font-bold transition ${
                  // عرض کامپوننت ها 
                  active === key
                    ? "bg-yellow-600 text-black"
                    : "bg-yellow-400 text-black hover:bg-yellow-500"
                }`}
              >
                {componentsMap[key].title}
              </button>
            ))}
          </div>
          <div className="col-span-3 bg-gray-800 rounded-xl p-6 shadow-lg">
            <ActiveComponent />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10 grid grid-cols-3 gap-6">
      {Object.keys(componentsMap).map((key) => (
        <AdminCard key={key} title={componentsMap[key].title} onClick={() => setActive(key)} />
      ))}
    </div>
  );
}