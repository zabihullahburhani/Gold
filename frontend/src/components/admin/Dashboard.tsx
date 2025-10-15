"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { fetchTransactions } from "../../services/transaction_api";
import { fetchCustomers } from "../../services/customers_api";
import { fetchExpenses } from "../../services/shop_expenses_api";
import { fetchCapitals } from "../../services/capital_api";
import CustomersScores from "../dashboardContents/Customers_Scores";
import DailyExpenses from "../dashboardContents/Daily_Expenses";
import FiveTopProfits from "../dashboardContents/FiveTopProfites";
import FiveTopTransactions from "../dashboardContents/FiveTopTransactions";
import KahataBalance from "../dashboardContents/kahata_Balance";
import ProfitLoss from "../dashboardContents/Profit_Loss";
import ToDaySummary from "../dashboardContents/ToDaySummary";
import TransactionSummary from "../dashboardContents/Transaction_Summary";
import { TimeRange, TimeGranularity } from "../../services/utils";

interface Transaction {
  txn_id: number;
  customer_id: number;
  type: "buy" | "sell";
  dollar_in: number;
  dollar_out: number;
  gold_in: number;
  gold_out: number;
  date: string;
  gold_rate: number;
}

interface Customer {
  customer_id: number;
  full_name: string;
}

interface ShopExpense {
  expense_id: number;
  amount: number;
  expense_date: string;
}

interface Capital {
  id: number;
  usd_capital: number;
  gold_capital: number;
  date: string;
}

type ChartType = "line" | "bar" | "candlestick";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<ShopExpense[]>([]);
  const [capitals, setCapitals] = useState<Capital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("today");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>("day");
  const [token, setToken] = useState<string | null>(null);

  // گرفتن توکن فقط در سمت کلاینت
  useEffect(() => {
    setToken(typeof window !== "undefined" ? localStorage.getItem("token") : null);
  }, []);

  const loadData = useCallback(async () => {
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [txnData, customerData, expenseData, capitalData] = await Promise.all([
        fetchTransactions(token),
        fetchCustomers(token),
        fetchExpenses(token),
        fetchCapitals(token),
      ]);
      setTransactions(Array.isArray(txnData) ? txnData : []);
      setCustomers(Array.isArray(customerData) ? customerData : []);
      setExpenses(Array.isArray(expenseData) ? expenseData : []);
      setCapitals(Array.isArray(capitalData) ? capitalData : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard data";
      console.error("Error loading dashboard data:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [loadData, token]);

  const getRangeLabel = (): string => {
    switch (selectedRange) {
      case "today": return "امروز";
      case "yesterday": return "دیروز";
      case "current_week": return "هفته جاری";
      case "current_month": return "ماه جاری";
      case "custom": return "انتخابی";
      case "all": return "کل";
      default: return "امروز";
    }
  };

  if (loading) {
    return <div className="text-center text-gray-200 py-10 bg-gray-900 min-h-screen">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400 py-10 bg-gray-900 min-h-screen">خطا: {error}</div>;
  }

  return (
    <div className="p-6 space-y-8 bg-gray-900 text-gray-200 min-h-screen font-inter">
      <h1 className="text-3xl font-bold text-gold-400 text-center">📊 داشبورد مدیریت</h1>

      {/* فیلتر تاریخ */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="text-xl font-semibold text-yellow-500">📅 فیلتر تاریخ</CardHeader>
        <CardContent className="space-y-4">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value as TimeRange)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200"
          >
            <option value="today">امروز</option>
            <option value="yesterday">دیروز</option>
            <option value="current_week">هفته جاری</option>
            <option value="current_month">ماه جاری</option>
            <option value="custom">انتخابی</option>
            <option value="all">همه</option>
          </select>
          {selectedRange === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200"
                placeholder="تاریخ شروع"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200"
                placeholder="تاریخ پایان"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* فیلتر نوع نمودار و بازه زمانی معاملات */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="text-xl font-semibold text-yellow-500">📈 فیلتر نمودار معاملات</CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">نوع نمودار</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200"
            >
              <option value="bar">بار پلات</option>
              <option value="line">لاین پلات</option>
              <option value="candlestick">کندل استیک</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">بازه زمانی</label>
            <select
              value={timeGranularity}
              onChange={(e) => setTimeGranularity(e.target.value as TimeGranularity)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-200"
            >
              <option value="minute">دقیقه</option>
              <option value="hour">ساعت</option>
              <option value="day">روز</option>
              <option value="week">هفته</option>
              <option value="month">ماه</option>
              <option value="year">سال</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* چیدمان کامپوننت‌های داشبورد */}
      <div className="grid grid-cols-1 gap-6">
        <ToDaySummary
          transactions={transactions}
          expenses={expenses}
          capitals={capitals}
          selectedRange={selectedRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
        <DailyExpenses
          expenses={expenses}
          selectedRange={selectedRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
        <FiveTopProfits
          transactions={transactions}
          selectedRange={selectedRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
        <FiveTopTransactions
          transactions={transactions}
          customers={customers}
          selectedRange={selectedRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
        <KahataBalance
          transactions={transactions}
          capitals={capitals}
          selectedRange={selectedRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
        <ProfitLoss
          transactions={transactions}
          selectedRange={selectedRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
        <CustomersScores
          transactions={transactions}
          customers={customers}
          selectedRange={selectedRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
        <TransactionSummary
          transactions={transactions}
          chartType={chartType}
          timeGranularity={timeGranularity}
          selectedRange={selectedRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
      </div>
    </div>
  );
}