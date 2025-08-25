"use client";
import { useState } from "react";
import Header from "../shared/Header";
import Footer from "../shared/Footer";
import Sidebar from "../shared/Sidebar";

// کامپوننت‌های یوزر
import Customers from "./Customers";
import Employees from "./Employees";
import GoldPrices from "./GoldPrices";
import Transactions from "./Transactions";
import GoldRateDifferences from "./GoldRateDifferences";
import ShopExpenses from "./ShopExpenses";
import UserProfile from "./UserProfile";
import Logout from "./Logout";

export default function UserDashboard() {
  const [activeComponent, setActiveComponent] = useState("Customers");

  const renderComponent = () => {
    switch (activeComponent) {
      case "Customers": return <Customers />;
      case "Employees": return <Employees />;
      case "GoldPrices": return <GoldPrices />;
      case "Transactions": return <Transactions />;
      case "GoldRateDifferences": return <GoldRateDifferences />;
      case "ShopExpenses": return <ShopExpenses />;
      case "UserProfile": return <UserProfile />;
      case "Logout": return <Logout />;
      default: return <Customers />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gold-400">
      <Header showSearch={true} />
      <div className="flex flex-1">
        <Sidebar active={activeComponent} setActive={setActiveComponent} />
        <main className="flex-1 p-4 overflow-auto">
          {renderComponent()}
        </main>
      </div>
      <Footer />
    </div>
  );
}
