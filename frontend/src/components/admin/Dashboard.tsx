


// نویسنده: ذبیح الله برهانی
// متخصص ICT, AI و رباتیک
// شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
// آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { fetchTransactions } from "../../services/transaction_api";
import { fetchCustomers } from "../../services/customers_api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Transaction {
  txn_id: number;
  customer_id: number;
  type: "buy" | "sell";
  dollar_in: number;
  dollar_out: number;
  gold_in: number;
  gold_out: number;
  date: string;
}

interface Customer {
  customer_id: number;
  full_name: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const loadData = useCallback(async () => {
    try {
      if (token) {
        const [txnData, customerData] = await Promise.all([
          fetchTransactions(token),
          fetchCustomers(token),
        ]);
        setTransactions(txnData);
        setCustomers(customerData);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // محاسبه تاریخ امروز و دیروز
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // محاسبه درآمد امروز، دیروز
  const todayProfit = transactions
    .filter((t) => t.date === today)
    .reduce((sum, t) => sum + (t.dollar_in - t.dollar_out), 0);

  const yesterdayProfit = transactions
    .filter((t) => t.date === yesterday)
    .reduce((sum, t) => sum + (t.dollar_in - t.dollar_out), 0);

  const nextDayPrediction = (todayProfit + yesterdayProfit) / 2; // پیش‌بینی ساده

  // سود/زیان کل هر مشتری
  const customerProfits = customers.map((c) => {
    const custTxns = transactions.filter((t) => t.customer_id === c.customer_id);
    const totalProfit = custTxns.reduce((sum, t) => sum + (t.dollar_in - t.dollar_out), 0);
    return { name: c.full_name, profit: totalProfit };
  });

  // تاپ‌ترین مشتریان (Top 5)
  const topCustomers = [...customerProfits]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  // بزرگترین معاملات (بر اساس دالر)
  const topTransactions = [...transactions]
    .sort((a, b) => Math.abs(b.dollar_in - b.dollar_out) - Math.abs(a.dollar_in - a.dollar_out))
    .slice(0, 5);

  // خلاصه روزانه
  const dailySummary = Object.values(
    transactions.reduce((acc: any, t) => {
      if (!acc[t.date]) {
        acc[t.date] = { date: t.date, profit: 0 };
      }
      acc[t.date].profit += t.dollar_in - t.dollar_out;
      return acc;
    }, {})
  ).sort((a: any, b: any) => a.date.localeCompare(b.date));

  // موجودی کل طلا و دالر
  const totalDollar = transactions.reduce((sum, t) => sum + (t.dollar_in - t.dollar_out), 0);
  const totalGold = transactions.reduce((sum, t) => sum + (t.gold_in - t.gold_out), 0);

  return (
    <div className="p-6 space-y-8 bg-gray-900 text-white min-h-screen font-inter">
      <h1 className="text-3xl font-bold text-teal-400 text-center">📊 داشبورد مدیریت</h1>

      {/* درآمد امروز، دیروز و پیش‌بینی فردا */}
      <Card className="bg-gray-800 border border-teal-700 rounded-xl shadow-xl p-6">
        <CardHeader>💰 خلاصه روزانه</CardHeader>
        <CardContent className="space-y-2">
          <p>سود/زیان امروز: <strong className="text-green-400">{todayProfit.toFixed(2)}</strong></p>
          <p>سود/زیان دیروز: <strong className="text-yellow-400">{yesterdayProfit.toFixed(2)}</strong></p>
          <p>پیش‌بینی فردا: <strong className="text-blue-400">{nextDayPrediction.toFixed(2)}</strong></p>
        </CardContent>
      </Card>

      {/* موجودی کل */}
      <Card className="bg-gray-800 border border-teal-700 rounded-xl shadow-xl p-6">
        <CardHeader>🏦 موجودی کل</CardHeader>
        <CardContent>
          <p>💵 کل دالر: <strong>{totalDollar.toFixed(2)}</strong></p>
          <p>🏅 کل طلا (گرم): <strong>{totalGold.toFixed(2)}</strong></p>
        </CardContent>
      </Card>

      {/* سود/زیان کل مشتریان */}
      <Card className="bg-gray-800 border border-teal-700 rounded-xl shadow-xl p-6">
        <CardHeader>👥 سود/زیان مشتریان</CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCustomers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="profit" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* بزرگترین معاملات */}
      <Card className="bg-gray-800 border border-teal-700 rounded-xl shadow-xl p-6">
        <CardHeader>🔥 بزرگترین معاملات</CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topTransactions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="txn_id" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey={(t) => Math.abs(t.dollar_in - t.dollar_out)} fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* خلاصه روزانه (نمودار) */}
      <Card className="bg-gray-800 border border-teal-700 rounded-xl shadow-xl p-6">
        <CardHeader>📈 خلاصه روزانه</CardHeader>
        <CardContent>
          {dailySummary.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dailySummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="profit" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-4">هیچ داده‌ای برای نمایش وجود ندارد.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
