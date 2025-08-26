"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Draggable from "react-draggable";
import {
  Users,
  UserCog,
  HandCoins,
  Gem,
  Scale,
  Wallet,
  UserCircle,
  LogOut,
  CreditCard,
} from "lucide-react";

// ✅ ایمپورت کامپوننت‌ها
import Customers from "./Customers";
import Employees from "./Employees";
import Transactions from "./Transactions";
import GoldPrices from "./GoldPrices";
import GoldRateDifferences from "./GoldRateDifferences";
import ShopExpenses from "./ShopExpenses";
import UserProfile from "./UserProfile";
import Notifications from "../shared/Notifications";
import Logout from "./Logout";
import BalanceDisplay from "../shared/BalanceDisplay";

// ✅ لیست سایدبار
const componentsList = [
  { id: "balance", name: "موجودی", icon: <CreditCard className="w-5 h-5" /> },
  { id: "customers", name: "مشتریان", icon: <Users className="w-5 h-5" /> },
  { id: "employees", name: "کارمندان", icon: <UserCog className="w-5 h-5" /> },
  { id: "transactions", name: "معاملات", icon: <HandCoins className="w-5 h-5" /> },
  { id: "goldPrices", name: "قیمت طلا", icon: <Gem className="w-5 h-5" /> },
  { id: "GoldRateDifferences", name: "تفاوت نرخ", icon: <Scale className="w-5 h-5" /> },
  { id: "ShopExpenses", name: "مصارف دوکان", icon: <Wallet className="w-5 h-5" /> },
  { id: "UserProfile", name: "پروفایل", icon: <UserCircle className="w-5 h-5" /> },
  { id: "notifications", name: "اعلان‌ها", icon: <BellIcon className="w-5 h-5" /> },
  { id: "Logout", name: "خروج", icon: <LogOut className="w-5 h-5" /> },
];

function BellIcon(props: any) {
  return <span {...props}>🔔</span>;
}

export default function UserDashboard() {
  const [selected, setSelected] = useState<string | null>(null);
  const nodeRef = useRef(null);

  return (
    <div className="flex min-h-screen">
      {/* ✅ سایدبار درگ‌ابل */}
      <Draggable nodeRef={nodeRef}>
        <motion.div
          ref={nodeRef}
          className="bg-black border-2 border-yellow-500 text-yellow-400 p-4 rounded-2xl shadow-lg flex flex-col gap-4 cursor-move"
          whileDrag={{ rotate: [0, -2, 2, -2, 2, 0] }}
        >
          {componentsList.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                selected === item.id
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </motion.div>
      </Draggable>

      {/* ✅ بخش مین */}
      <main className="flex-1 p-6">
        {selected === "balance" && <BalanceDisplay />}
        {selected === "customers" && <Customers />}
        {selected === "employees" && <Employees />}
        {selected === "transactions" && <Transactions />}
        {selected === "goldPrices" && <GoldPrices />}
        {selected === "GoldRateDifferences" && <GoldRateDifferences />}
        {selected === "ShopExpenses" && <ShopExpenses />}
        {selected === "UserProfile" && <UserProfile />}
        {selected === "notifications" && <Notifications />}
        {selected === "Logout" && <Logout />}
        
      </main>
    </div>
  );
}
