// کد دشبورد نهایی بدون کهاته است.

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { fetchTransactions } from "../../services/transaction_api";
import { fetchCustomers } from "../../services/customers_api";
import { fetchExpenses } from "../../services/shop_expenses_api";
import { fetchCapitals } from "../../services/capital_api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import moment from "moment-jalaali";
import "moment-timezone";

interface Transaction {
  txn_id: number;
  customer_id: number;
  type: "buy" | "sell";
  dollar_in: number;
  dollar_out: number;
  gold_in: number;
  gold_out: number;
  date: string; // YYYY-MM-DDTHH:mm:ss
  created_at_jalali?: string;
  dollar_balance?: number;
  gold_balance?: number;
  gold_rate: number;
}

interface Customer {
  customer_id: number;
  full_name: string;
}

interface ShopExpense {
  expense_id: number;
  amount: number;
  expense_date: string; // YYYY-MM-DDTHH:mm:ss
  expense_date_jalali?: string;
}

interface Capital {
  id: number;
  usd_capital: number;
  gold_capital: number;
  date: string;
}

type TimeRange = "today" | "yesterday" | "current_week" | "current_month" | "custom" | "all";
type ChartType = "line" | "bar" | "candlestick";
type TimeGranularity = "minute" | "hour" | "day" | "week" | "month" | "year";

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

  // تابع کمکی برای فرمت تاریخ به هجری شمسی
  const toJalaliDate = (isoDate: string, granularity: TimeGranularity): string => {
    if (!isoDate) return "";
    const date = moment(isoDate).tz("Asia/Kabul");
    return date.isValid()
      ? date.format(
          granularity === "year" ? "jYYYY" :
          granularity === "month" ? "jYYYY/jMM" :
          granularity === "week" ? "jYYYY/jMM/jDD" :
          granularity === "day" ? "jYYYY/jMM/jDD" :
          granularity === "hour" ? "jYYYY/jMM/jDD HH:00" :
          "jYYYY/jMM/jDD HH:mm"
        )
      : "";
  };

  // تابع کمکی برای دریافت عنوان بازه زمانی
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

  // تابع کمکی برای فیلتر داده‌ها بر اساس بازه تاریخ
  const getFilteredData = (data: any[], key: string = "date") => {
    if (!data || !Array.isArray(data)) return [];
    const now = moment().tz("Asia/Kabul");
    if (selectedRange === "custom" && customStartDate && customEndDate) {
      const start = moment(customStartDate).tz("Asia/Kabul").startOf("day");
      const end = moment(customEndDate).tz("Asia/Kabul").endOf("day");
      return data.filter((item) => {
        const itemDate = moment(item[key]).tz("Asia/Kabul");
        return itemDate.isValid() && itemDate.isBetween(start, end, undefined, "[]");
      });
    } else if (selectedRange === "today") {
      const today = now.startOf("day");
      return data.filter((item) => {
        const itemDate = moment(item[key]).tz("Asia/Kabul");
        return itemDate.isValid() && itemDate.isSame(today, "day");
      });
    } else if (selectedRange === "yesterday") {
      const yesterday = now.clone().subtract(1, "days").startOf("day");
      return data.filter((item) => {
        const itemDate = moment(item[key]).tz("Asia/Kabul");
        return itemDate.isValid() && itemDate.isSame(yesterday, "day");
      });
    } else if (selectedRange === "current_week") {
      const startOfWeek = now.startOf("week");
      const endOfWeek = now.endOf("week");
      return data.filter((item) => {
        const itemDate = moment(item[key]).tz("Asia/Kabul");
        return itemDate.isValid() && itemDate.isBetween(startOfWeek, endOfWeek, undefined, "[]");
      });
    } else if (selectedRange === "current_month") {
      const startOfMonth = now.startOf("month");
      const endOfMonth = now.endOf("month");
      return data.filter((item) => {
        const itemDate = moment(item[key]).tz("Asia/Kabul");
        return itemDate.isValid() && itemDate.isBetween(startOfMonth, endOfMonth, undefined, "[]");
      });
    }
    return data; // برای "all"
  };

  const filteredTransactions = getFilteredData(transactions);
  const filteredExpenses = getFilteredData(expenses, "expense_date");

  // محاسبه مجموع مصارف ماهانه
  const monthlyExpenses = Object.values(
    expenses.reduce((acc: any, e) => {
      const date = moment(e.expense_date).tz("Asia/Kabul");
      const month = date.isValid() ? date.format("jYYYY/jMM") : "";
      if (!acc[month] && month) {
        acc[month] = { month, amount: 0 };
      }
      if (month) acc[month].amount += e.amount || 0;
      return acc;
    }, {})
  ).sort((a: any, b: any) => a.month.localeCompare(b.month));

  // محاسبات خلاصه بر اساس بازه زمانی
  const rangeProfit = filteredTransactions
    .filter((t) => t.type === "sell")
    .reduce((sum, t) => sum + (t.dollar_in - t.dollar_out), 0);

  const rangeLoss = filteredTransactions
    .filter((t) => t.type === "buy")
    .reduce((sum, t) => sum + (t.dollar_out - t.dollar_in), 0);

  const rangeExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const latestDollarBalance = filteredTransactions.length > 0
    ? filteredTransactions[filteredTransactions.length - 1]?.dollar_balance || 0
    : 0;
  const totalUsdCapital = capitals.reduce((sum, c) => sum + (c.usd_capital || 0), 0);
  const rangeDollarRevenue = latestDollarBalance + totalUsdCapital;

  const latestGoldBalance = filteredTransactions.length > 0
    ? filteredTransactions[filteredTransactions.length - 1]?.gold_balance || 0
    : 0;
  const totalGoldCapital = capitals.reduce((sum, c) => sum + (c.gold_capital || 0), 0);
  const rangeGoldRevenue = latestGoldBalance + totalGoldCapital;

  const customerProfits = customers.map((c) => {
    const custTxns = filteredTransactions.filter((t) => t.customer_id === c.customer_id);
    const totalProfit = custTxns.reduce((sum, t) => sum + (t.dollar_in - t.dollar_out), 0);
    return { name: c.full_name, profit: totalProfit };
  });

  const topCustomers = [...customerProfits]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  const topDollarTransactions = [...filteredTransactions]
    .sort((a, b) => Math.abs(b.dollar_in - b.dollar_out) - Math.abs(a.dollar_in - a.dollar_out))
    .slice(0, 5);

  const topGoldTransactions = [...filteredTransactions]
    .sort((a, b) => Math.abs(b.gold_in - b.gold_out) - Math.abs(a.gold_in - a.gold_out))
    .slice(0, 5);

  const customerScores = customers.map((c) => {
    const custTxns = filteredTransactions.filter((t) => t.customer_id === c.customer_id);
    const buyCount = custTxns.filter((t) => t.type === "buy").length;
    const sellCount = custTxns.filter((t) => t.type === "sell").length;
    const totalDollarOut = custTxns.reduce((sum, t) => sum + t.dollar_out, 0);
    const totalDollarIn = custTxns.reduce((sum, t) => sum + t.dollar_in, 0);
    const totalGoldOut = custTxns.reduce((sum, t) => sum + t.gold_out, 0);
    const totalGoldIn = custTxns.reduce((sum, t) => sum + t.gold_in, 0);
    const score = (buyCount + sellCount) * 10 + Math.abs(totalDollarOut - totalDollarIn) / 10000 + Math.abs(totalGoldOut - totalGoldIn) / 10;
    return { name: c.full_name, score };
  });

  // داده‌های معاملات برای نمودارها
  const getTransactionData = () => {
    const groupedData = filteredTransactions.reduce((acc: any, t) => {
      const date = moment(t.date).tz("Asia/Kabul");
      if (!date.isValid()) return acc;
      let key: string;
      switch (timeGranularity) {
        case "minute":
          key = date.format("jYYYY/jMM/jDD HH:mm");
          break;
        case "hour":
          key = date.format("jYYYY/jMM/jDD HH:00");
          break;
        case "day":
          key = date.format("jYYYY/jMM/jDD");
          break;
        case "week":
          key = date.startOf("week").format("jYYYY/jMM/jDD");
          break;
        case "month":
          key = date.format("jYYYY/jMM");
          break;
        case "year":
          key = date.format("jYYYY");
          break;
        default:
          key = date.format("jYYYY/jMM/jDD");
      }
      if (!acc[key]) {
        acc[key] = { time: key, dollarVolume: 0, goldVolume: 0, sellTxns: [] };
      }
      acc[key].dollarVolume += Math.abs(t.dollar_in - t.dollar_out);
      acc[key].goldVolume += Math.abs(t.gold_in - t.gold_out);
      if (t.type === "sell") {
        acc[key].sellTxns.push(t);
      }
      return acc;
    }, {});

    return Object.values(groupedData).sort((a: any, b: any) => a.time.localeCompare(b.time));
  };

  // داده‌های Candlestick برای نرخ طلا
  const getCandlestickData = () => {
    const groupedData = filteredTransactions.reduce((acc: any, t) => {
      const date = moment(t.date).tz("Asia/Kabul");
      if (!date.isValid()) return acc;
      let key: string;
      switch (timeGranularity) {
        case "minute":
          key = date.format("jYYYY/jMM/jDD HH:mm");
          break;
        case "hour":
          key = date.format("jYYYY/jMM/jDD HH:00");
          break;
        case "day":
          key = date.format("jYYYY/jMM/jDD");
          break;
        case "week":
          key = date.startOf("week").format("jYYYY/jMM/jDD");
          break;
        case "month":
          key = date.format("jYYYY/jMM");
          break;
        case "year":
          key = date.format("jYYYY");
          break;
        default:
          key = date.format("jYYYY/jMM/jDD");
      }
      if (!acc[key]) {
        acc[key] = { time: key, txns: [], buyVolume: 0, sellVolume: 0 };
      }
      acc[key].txns.push(t);
      if (t.type === "buy") {
        acc[key].buyVolume += t.gold_in;
      } else if (t.type === "sell") {
        acc[key].sellVolume += t.gold_out;
      }
      return acc;
    }, {});

    return Object.values(groupedData).map((group: any) => {
      const txns = group.txns.sort((a: Transaction, b: Transaction) => moment(a.date).tz("Asia/Kabul").diff(moment(b.date).tz("Asia/Kabul")));
      const goldRates = txns.map((t: Transaction) => t.gold_rate).filter((rate: number) => rate > 0);
      const averageGoldRate = goldRates.length > 0 ? goldRates.reduce((sum: number, rate: number) => sum + rate, 0) / goldRates.length : 0;
      return {
        time: group.time,
        open: txns.length > 0 ? txns[0].gold_rate : 0,
        close: txns.length > 0 ? txns[txns.length - 1].gold_rate : 0,
        high: goldRates.length > 0 ? Math.max(...goldRates) : 0,
        low: goldRates.length > 0 ? Math.min(...goldRates) : 0,
        average: averageGoldRate,
        buyVolume: group.buyVolume,
        sellVolume: group.sellVolume,
      };
    }).sort((a: any, b: any) => a.time.localeCompare(b.time));
  };

  const transactionData = getTransactionData();
  const candlestickData = getCandlestickData();

  // مفاد و ضرر بر اساس تاریخ
  const dailySummary = Object.values(
    filteredTransactions.reduce((acc: any, t) => {
      const date = toJalaliDate(t.date, timeGranularity);
      if (!date) return acc;
      if (!acc[date]) {
        acc[date] = { date, profit: 0, loss: 0 };
      }
      if (t.type === "sell") {
        acc[date].profit += t.dollar_in - t.dollar_out;
      } else {
        acc[date].loss += t.dollar_out - t.dollar_in;
      }
      return acc;
    }, {})
  ).sort((a: any, b: any) => a.date.localeCompare(b.date));

  const topProfits = [...dailySummary]
    .sort((a: any, b: any) => b.profit - a.profit)
    .slice(0, 5);

  const totalDollar = filteredTransactions.reduce((sum, t) => sum + (t.dollar_in - t.dollar_out), 0);
  const totalGold = filteredTransactions.reduce((sum, t) => sum + (t.gold_in - t.gold_out), 0);

  if (loading) {
    return <div className="text-center text-gray-200 py-10 bg-gray-900 min-h-screen">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400 py-10 bg-gray-900 min-h-screen">خطا: {error}</div>;
  }

  return (
    <div className="p-6 space-y-8 bg-gray-900 text-gray-200 min-h-screen font-inter">
      <h1 className="text-3xl font-bold text-gold-400 text-center">📊 داشبورد مدیریت</h1>

      {/* خلاصه بازه زمانی */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="text-2xl font-semibold text-yellow-500">
          💰 خلاصه {getRangeLabel()}
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">مفاد {getRangeLabel()}</p>
            <p className="text-lg font-bold text-green-400">{rangeProfit.toFixed(2)} دالر</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">ضرر {getRangeLabel()}</p>
            <p className="text-lg font-bold text-red-400">{rangeLoss.toFixed(2)} دالر</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">مصارف {getRangeLabel()} (AFN)</p>
            <p className="text-lg font-bold text-yellow-400">{rangeExpenses.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">جمع دخل دالری {getRangeLabel()}</p>
            <p className="text-lg font-bold text-blue-400">{rangeDollarRevenue.toFixed(2)} دالر</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">جمع دخل طلای {getRangeLabel()}</p>
            <p className="text-lg font-bold text-yellow-400">{rangeGoldRevenue.toFixed(2)} گرم</p>
          </div>
        </CardContent>
      </Card>

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

      {/* مصارف ماهانه */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="text-xl font-semibold text-yellow-500">📊 مصارف ماهانه (AFN)</CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" label={{ value: "افغانی", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
              <Tooltip
                formatter={(value) => `${Number(value).toFixed(2)} افغانی`}
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
              />
              <Bar dataKey="amount" fill="#FBBF24" />
            </BarChart>
          </ResponsiveContainer>
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

      {/* نمودار معاملات (دالر) */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="text-xl font-semibold text-yellow-500">📈 معاملات دالری</CardHeader>
        <CardContent>
          {chartType === "bar" && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: "دالر", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
                <Tooltip
                  formatter={(value) => `${Number(value).toFixed(2)} دالر`}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
                />
                <Bar dataKey="dollarVolume" fill="#14B8A6" />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chartType === "line" && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: "دالر", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
                <Tooltip
                  formatter={(value) => `${Number(value).toFixed(2)} دالر`}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
                />
                <Line type="monotone" dataKey="dollarVolume" stroke="#14B8A6" />
              </LineChart>
            </ResponsiveContainer>
          )}
          {chartType === "candlestick" && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={candlestickData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: "دالر", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
                <Tooltip
                  formatter={(value, name) => `${Number(value).toFixed(2)} ${name === "average" ? "دالر (متوسط)" : name.includes("Volume") ? "گرم" : "دالر"}`}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
                  content={({ payload, label }) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-700 p-3 rounded-lg shadow text-gray-200">
                          <p>زمان: {label}</p>
                          <p>باز شدن: {data.open.toFixed(2)} دالر</p>
                          <p>بسته شدن: {data.close.toFixed(2)} دالر</p>
                          <p>بالاترین: {data.high.toFixed(2)} دالر</p>
                          <p>پایین‌ترین: {data.low.toFixed(2)} دالر</p>
                          <p>متوسط: {data.average.toFixed(2)} دالر</p>
                          <p>حجم خرید: {data.buyVolume.toFixed(2)} گرم</p>
                          <p>حجم فروش: {data.sellVolume.toFixed(2)} گرم</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="open"
                  fill="#14B8A6"
                  shape={(props: any) => {
                    const { x, y, width, payload } = props;
                    const open = payload.open;
                    const close = payload.close;
                    const high = payload.high;
                    const low = payload.low;
                    const isBullish = close >= open;
                    return (
                      <g>
                        <line
                          x1={x + width / 2}
                          y1={y - (high - open) * (y / open)}
                          x2={x + width / 2}
                          y2={y + (open - low) * (y / open)}
                          stroke="#9CA3AF"
                        />
                        <rect
                          x={x}
                          y={isBullish ? y - (close - open) * (y / open) : y}
                          width={width}
                          height={Math.abs(close - open) * (y / open) || 1}
                          fill={isBullish ? "#14B8A6" : "#EF4444"}
                        />
                      </g>
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* نمودار معاملات (طلا) */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="text-xl font-semibold text-yellow-500">📈 معاملات طلایی (گرم)</CardHeader>
        <CardContent>
          {chartType === "bar" && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: "گرم", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
                <Tooltip
                  formatter={(value) => `${Number(value).toFixed(2)} گرم`}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
                />
                <Bar dataKey="goldVolume" fill="#FBBF24" />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chartType === "line" && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: "گرم", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
                <Tooltip
                  formatter={(value) => `${Number(value).toFixed(2)} گرم`}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
                />
                <Line type="monotone" dataKey="goldVolume" stroke="#FBBF24" />
              </LineChart>
            </ResponsiveContainer>
          )}
          {chartType === "candlestick" && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={candlestickData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: "دالر", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
                <Tooltip
                  formatter={(value, name) => `${Number(value).toFixed(2)} ${name === "average" ? "دالر (متوسط)" : name.includes("Volume") ? "گرم" : "دالر"}`}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
                  content={({ payload, label }) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-700 p-3 rounded-lg shadow text-gray-200">
                          <p>زمان: {label}</p>
                          <p>باز شدن: {data.open.toFixed(2)} دالر</p>
                          <p>بسته شدن: {data.close.toFixed(2)} دالر</p>
                          <p>بالاترین: {data.high.toFixed(2)} دالر</p>
                          <p>پایین‌ترین: {data.low.toFixed(2)} دالر</p>
                          <p>متوسط: {data.average.toFixed(2)} دالر</p>
                          <p>حجم خرید: {data.buyVolume.toFixed(2)} گرم</p>
                          <p>حجم فروش: {data.sellVolume.toFixed(2)} گرم</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="open"
                  fill="#FBBF24"
                  shape={(props: any) => {
                    const { x, y, width, payload } = props;
                    const open = payload.open;
                    const close = payload.close;
                    const high = payload.high;
                    const low = payload.low;
                    const isBullish = close >= open;
                    return (
                      <g>
                        <line
                          x1={x + width / 2}
                          y1={y - (high - open) * (y / open)}
                          x2={x + width / 2}
                          y2={y + (open - low) * (y / open)}
                          stroke="#9CA3AF"
                        />
                        <rect
                          x={x}
                          y={isBullish ? y - (close - open) * (y / open) : y}
                          width={width}
                          height={Math.abs(close - open) * (y / open) || 1}
                          fill={isBullish ? "#14B8A6" : "#EF4444"}
                        />
                      </g>
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* پنج تاپ‌ترین معاملات دالری */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="text-xl font-semibold text-yellow-500">🔝 پنج تاپ‌ترین معاملات دالری</CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topDollarTransactions.map((t) => ({
                name: customers.find((c) => c.customer_id === t.customer_id)?.full_name || "نامشخص",
                value: Math.abs(t.dollar_in - t.dollar_out),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" label={{ value: "دالر", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
              <Tooltip
                formatter={(value) => `${Number(value).toFixed(2)} دالر`}
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
              />
              <Bar dataKey="value" fill="#14B8A6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* پنج تاپ‌ترین معاملات طلایی */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="text-xl font-semibold text-yellow-500">🔝 پنج تاپ‌ترین معاملات طلایی (گرم)</CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topGoldTransactions.map((t) => ({
                name: customers.find((c) => c.customer_id === t.customer_id)?.full_name || "نامشخص",
                value: Math.abs(t.gold_in - t.gold_out),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" label={{ value: "گرم", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
              <Tooltip
                formatter={(value) => `${Number(value).toFixed(2)} گرم`}
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
              />
              <Bar dataKey="value" fill="#FBBF24" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* امتیازات مشتریان */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="text-xl font-semibold text-yellow-500">🏆 امتیازات مشتریان</CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" label={{ value: "امتیاز", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
              <Tooltip
                formatter={(value) => `${Number(value).toFixed(2)} امتیاز`}
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
              />
              <Bar dataKey="score" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* مفاد و ضرر بر اساس تاریخ */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="text-xl font-semibold text-yellow-500">📈 مفاد و ضرر بر اساس تاریخ</CardHeader>
        <CardContent>
          {dailySummary.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dailySummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: "دالر", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
                <Tooltip
                  formatter={(value) => `${Number(value).toFixed(2)} دالر`}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
                />
                <Bar dataKey="profit" fill="#14B8A6" name="مفاد" />
                <Bar dataKey="loss" fill="#EF4444" name="ضرر" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-4">هیچ داده‌ای برای نمایش وجود ندارد.</p>
          )}
        </CardContent>
      </Card>

      {/* پنج بیشترین مفاد */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="text-xl font-semibold text-yellow-500">🔝 پنج بیشترین مفاد</CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProfits}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" label={{ value: "دالر", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
              <Tooltip
                formatter={(value) => `${Number(value).toFixed(2)} دالر`}
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
              />
              <Bar dataKey="profit" fill="#14B8A6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* موجودی کل */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="text-xl font-semibold text-yellow-500">🏦 موجودی کل</CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">کل دالر</p>
            <p className="text-lg font-bold text-blue-400">{totalDollar.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">کل طلا (گرم)</p>
            <p className="text-lg font-bold text-yellow-400">{totalGold.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
