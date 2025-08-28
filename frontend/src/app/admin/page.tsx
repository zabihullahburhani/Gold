// frontend/src/app/admin/page.tsx
// This is the main admin page with cards for different sections.
// Added CreateUser to the map for employee management.
// Created by: Professor Zabihullah Burhani
// ICT and AI and Robotics Specialist
// Phone: 0705002913, Email: zabihullahburhani@gmail.com
// Address: Takhar University, Computer Science Faculty.

"use client";

import { useState } from "react";
import CreateUser from "../../components/admin/CreateUser";
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

// Map of components with titles and icons
const componentsMap: any = {
  dashboard: { title: "📊 صفحه دشبورد", component: Dashboard },
  customers: { title: "👥 مدیریت مشتریان", component: Customers },
  employees: { title: "🏢 کارمندان", component: Employees },
  createuser: { title: "➕ ایجاد یوزر", component: CreateUser },
  goldprices: { title: "💰 قیمت طلا", component: GoldPrices },
  transactions: { title: "📊 تراکنش‌ها", component: Transactions },
  reports: { title: "📑 گزارش‌ها", component: Reports },
  goldratediff: { title: "📉 تفاوت نرخ طلا", component: GoldRateDifferences },
  expenses: { title: "💵 هزینه‌ها", component: ShopExpenses },
  appactivation: { title: "🔑 فعال‌سازی اپلیکیشن", component: AppActivation },
  dbsettings: { title: "🗄 تنظیمات دیتابیس", component: DatabaseSettings },
  settings: { title: "⚙️ تنظیمات", component: Settings },
  logout: { title: "🚪 خروج", component: Logout },
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
                className={`block w-[200px] p-3 rounded-lg text-right font-bold transition ${
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