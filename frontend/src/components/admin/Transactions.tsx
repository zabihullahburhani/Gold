"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
// فرض بر وجود این کامپوننت‌ها در مسیر ./ui/card
import { Card, CardHeader, CardContent } from "./ui/card"; 

// فرض بر وجود این توابع
import {
  createTransaction,
  fetchTransactions,
  updateTransaction,
  deleteTransaction,
} from "../../services/transaction_api";

import { fetchCustomers } from "../../services/customers_api";

// --- تعریف واسط‌ها (Interfaces) ---

interface Customer {
  customer_id: number;
  full_name: string;
}

interface Transaction {
  txn_id: number;
  customer_id: number;
  type: "buy" | "sell";
  dollar_balance: number;
  dollar_in: number;
  dollar_out: number;
  gold_balance: number;
  gold_in: number;
  gold_out: number;
  detail?: string;
  date: string; // YYYY-MM-DDTHH:mm:ss
  created_at?: string;
  created_at_jalali?: string; // تاریخ هجری شمسی (ارائه‌شده توسط backend)
  source_carat?: number;
  weight?: number;
  gold_rate?: number;
  gold_amount?: number;
}

// برای نمایش در جدول
interface ExtendedTransaction extends Transaction {
    goldRateTxn: number;
    buyGold: number;
    sellGold: number;
    buyPrice: number;
    sellPrice: number;
    goldBalance: number;
    label: string; // 'اضافی' | 'باقی'
}

// --- ثوابت ---
const STANDARD_CARAT = 23.88;
const TOLA_WEIGHT = 12.15;
const ROWS_PER_PAGE = 10; 

// ⬅️ TimeRange جدید شامل custom
type TimeRange = 'today' | 'yesterday' | 'day_before' | 'current_week' | 'current_month' | 'all' | 'custom';

// ----------------------------------------------
// تابع کمکی برای دریافت تاریخ‌های شروع و پایان بازه‌های زمانی
// ----------------------------------------------
const getRangeDates = (range: TimeRange, customStart?: string | null, customEnd?: string | null) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); 
    let startDate: Date | null = null;
    let endDate: Date = new Date(); 
    
    // تنظیم دقیق انتهای روز جاری (23:59:59.999) برای endDate
    endDate.setHours(23, 59, 59, 999);

    switch (range) {
        case 'today':
            startDate = new Date(now);
            break;
        case 'yesterday':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 1);
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'day_before':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 2);
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'current_week':
            // شروع هفته از شنبه (0)
            const firstDayOfWeek = now.getDate() - now.getDay();
            startDate = new Date(now);
            startDate.setDate(firstDayOfWeek);
            break;
        case 'current_month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'custom':
            if (customStart) {
                startDate = new Date(customStart);
                startDate.setHours(0, 0, 0, 0);
            }
            if (customEnd) {
                endDate = new Date(customEnd);
                endDate.setHours(23, 59, 59, 999);
            }
            break;
        case 'all':
        default:
            return { startDate: null, endDate: null };
    }
    
    if (startDate && range !== 'custom') startDate.setHours(0, 0, 0, 0);
    
    return { startDate, endDate };
};

// ----------------------------------------------
// تابع کمکی برای فرمت تاریخ به فرمت datetime-local
// ----------------------------------------------
const toDatetimeLocal = (date: Date): string => {
  const offset = 4.5 * 60; // افست افغانستان (UTC+4:30)
  const localDate = new Date(date.getTime() + offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

// ----------------------------------------------
// کامپوننت Transactions
// ----------------------------------------------

export default function Transactions() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);

  // ⬅️ استیت‌های جدید برای فیلترینگ و صفحه‌بندی
  const [selectedRange, setSelectedRange] = useState<TimeRange>('today');
  const [customStartDate, setCustomStartDate] = useState<string>(''); // ⬅️ تاریخ شروع سفارشی
  const [customEndDate, setCustomEndDate] = useState<string>(''); // ⬅️ تاریخ پایان سفارشی
  const [currentPage, setCurrentPage] = useState(1);
    
  // Form state
  const [customerId, setCustomerId] = useState<number | "">("");
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [weight, setWeight] = useState<number>(0);
  const [sourceCarat, setSourceCarat] = useState<number>(0);
  const [goldRate, setGoldRate] = useState<number>(0);
  const [detail, setDetail] = useState<string>("");
  const [date, setDate] = useState<string>(toDatetimeLocal(new Date())); // زمان محلی افغانستان

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // --- بارگیری داده‌ها و مرتب‌سازی ---
  const loadData = useCallback(async () => {
    try {
      if (token) {
        const [txnData, customerData] = await Promise.all([
          fetchTransactions(token),
          fetchCustomers(token),
        ]);

        // مرتب‌سازی بر اساس ID (قدیمی به جدید، برای محاسبه صحیح بیلانس تجمعی)
        const sortedTxnData = txnData.sort((a: Transaction, b: Transaction) => a.txn_id - b.txn_id);

        setTransactions(sortedTxnData);
        setCustomers(customerData);
      }
    } catch (err) {
      console.error("Error loading initial data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);
    
  // ریست کردن صفحه به 1 هر بار که فیلتر زمانی یا تاریخ‌های سفارشی تغییر می‌کند
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRange, customStartDate, customEndDate]);

  // --- منطق محاسبات فرم ---
  const goldAmount = useMemo(() => {
    if (weight > 0 && sourceCarat > 0) {
      return (weight * sourceCarat) / STANDARD_CARAT;
    }
    return 0;
  }, [weight, sourceCarat]);

  const goldPrice = useMemo(() => {
    if (goldAmount > 0 && goldRate > 0) {
      return (goldAmount / TOLA_WEIGHT) * goldRate;
    }
    return 0;
  }, [goldAmount, goldRate]);

  // --- مدیریت فرم و ارسال ---
  const clearForm = () => {
    setEditingTxn(null);
    setCustomerId("");
    setType("buy");
    setWeight(0);
    setSourceCarat(0);
    setGoldRate(0);
    setDetail("");
    setDate(toDatetimeLocal(new Date()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
      
    let dollarIn = 0;
    let dollarOut = 0;
    let goldIn = 0;
    let goldOut = 0;

    if (type === "buy") {
      goldIn = goldAmount;
      dollarOut = goldPrice;
    } else { // sell
      goldOut = goldAmount;
      dollarIn = goldPrice;
    }
      
    try {
      if (!token) throw new Error("Authentication token not found.");

      const data = {
        customer_id: Number(customerId),
        type,
        dollar_in: dollarIn,
        dollar_out: dollarOut,
        gold_in: goldIn,
        gold_out: goldOut,
        dollar_balance: dollarIn - dollarOut,
        gold_balance: goldIn - goldOut,
        detail,
        date,
        gold_rate: goldRate,
        weight: weight,
        source_carat: sourceCarat,
        gold_amount: goldAmount,
      };

      if (editingTxn) {
        await updateTransaction(token, editingTxn.txn_id, data);
      } else {
        await createTransaction(token, data);
      }

      clearForm();
      await loadData();
    } catch (err) {
      console.error("Failed to save transaction:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (txn: Transaction) => {
    setEditingTxn(txn);
    setCustomerId(txn.customer_id);
    setType(txn.type);
    setDetail(txn.detail || "");
    setDate(txn.date ? toDatetimeLocal(new Date(txn.date)) : toDatetimeLocal(new Date()));
    setWeight(txn.weight || 0);
    setSourceCarat(txn.source_carat || 0);
    setGoldRate(txn.gold_rate || 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این تراکنش را حذف کنید؟")) return;
    try {
      if (!token) throw new Error("Authentication token not found.");
      await deleteTransaction(token, id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    }
  };

  const getCustomerName = (id: number) => customers.find((c) => c.customer_id === id)?.full_name || "نامشخص";

  // ----------------------------------------------
  // منطق فیلترینگ و محاسبه (Filter & Computation Logic)
  // ----------------------------------------------
  const filteredTransactions = useMemo(() => {
    const { startDate, endDate } = getRangeDates(selectedRange, customStartDate, customEndDate);
    if (!startDate) return transactions;

    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    return transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      const txnTimestamp = txnDate.getTime() + (4.5 * 60 * 60 * 1000);
      return txnTimestamp >= startTimestamp && txnTimestamp <= endTimestamp;
    });
  }, [transactions, selectedRange, customStartDate, customEndDate]);

  const extendedTransactions: ExtendedTransaction[] = useMemo(() => {
    const extended: ExtendedTransaction[] = [];
    let cumulativeGoldBalance = 0;

    for (const txn of filteredTransactions) {
      const goldAmountTxn = txn.gold_amount || Math.abs(txn.gold_in - txn.gold_out);
      const goldRateTxn = txn.gold_rate || 0;
      const goldPriceTxn = (goldAmountTxn / TOLA_WEIGHT) * goldRateTxn;

      const buyGold = txn.type === "buy" ? goldAmountTxn : 0;
      const sellGold = txn.type === "sell" ? goldAmountTxn : 0;
      const buyPrice = txn.type === "buy" ? goldPriceTxn : 0;
      const sellPrice = txn.type === "sell" ? goldPriceTxn : 0;

      if (txn.type === "buy") {
        cumulativeGoldBalance += goldAmountTxn;
      } else if (txn.type === "sell") {
        cumulativeGoldBalance -= goldAmountTxn;
      }

      let label = "";
      if (Math.abs(cumulativeGoldBalance) < 0.0001 || cumulativeGoldBalance < 0) {
        label = "باقی";
      } else {
        label = "اضافی";
      }

      const goldBalance = Math.abs(cumulativeGoldBalance);

      extended.push({
        ...txn,
        goldRateTxn,
        buyGold,
        sellGold,
        buyPrice,
        sellPrice,
        goldBalance,
        label,
      });
    }
    return extended;
  }, [filteredTransactions]);

  const totals = useMemo(() => {
    return extendedTransactions.reduce((acc, txn) => {
      acc.totalBuyGold += txn.buyGold;
      acc.totalSellGold += txn.sellGold;
      acc.totalBuyPrice += txn.buyPrice;
      acc.totalSellPrice += txn.sellPrice;
      return acc;
    }, {
      totalBuyGold: 0,
      totalSellGold: 0,
      totalBuyPrice: 0,
      totalSellPrice: 0,
    });
  }, [extendedTransactions]);

  const netProfitLoss = totals.totalSellPrice - totals.totalBuyPrice;
  const profitLossLabel = netProfitLoss >= 0 ? "مفاد" : "ضرر";
  const profitLossValue = Math.abs(netProfitLoss);

  // ----------------------------------------------
  // منطق Pagination (صفحه‌بندی)
  // ----------------------------------------------
  const totalPages = Math.ceil(extendedTransactions.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const currentTransactions = extendedTransactions.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // ----------------------------------------------
  // UI Constants (کلاس‌های فشرده شده)
  // ----------------------------------------------
  const baseClasses = "px-2 py-1 text-sm text-gray-300 border-b border-gray-700 border-l";
  const headerClasses = "px-2 py-1 text-right text-xs font-medium text-gray-300 border-l border-gray-700";

  const timeRangeOptions: { value: TimeRange, label: string }[] = [
    { value: 'today', label: 'امروز' },
    { value: 'yesterday', label: 'دیروز' },
    { value: 'day_before', label: 'پریروز' },
    { value: 'current_week', label: 'هفته جاری' },
    { value: 'current_month', label: 'ماه جاری' },
    { value: 'custom', label: 'فیلتر دلخواه (تاریخ)' },
    { value: 'all', label: 'همهٔ تراکنش‌ها' },
  ];

  return (
    <div className="p-2 space-y-3 bg-gray-900 text-white min-h-screen font-inter">
      {/* -------------------------------------------------- */}
      {/* فرم ثبت/ویرایش معامله */}
      {/* -------------------------------------------------- */}
      <Card className="rounded-xl overflow-hidden bg-gray-800 p-3 shadow-xl border border-teal-700">
        <CardHeader>
          <h1 className="text-3xl font-bold text-center text-teal-400">💰 مدیریت معاملات طلا (عیار مبدا)</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* مشتری */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">👤 مشتری</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(parseInt(e.target.value) || "")}
                className="w-full p-1 rounded-lg bg-gray-700 border border-gray-600 text-white"
                required
              >
                <option value="">یک مشتری انتخاب کنید</option>
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* نوع معامله (خرید/فروش) */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">نوع معامله</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "buy" | "sell")}
                className="w-full p-1 rounded-lg bg-gray-700 border border-gray-600 text-white"
              >
                <option value="buy">خرید</option>
                <option value="sell">فروش</option>
              </select>
            </div>

            {/* وزن */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">⚖️ وزن (گرم)</label>
              <input
                type="number"
                step="0.0001"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full p-1 rounded-lg bg-gray-700 border border-gray-600 text-white"
                min={0}
                required
              />
            </div>

            {/* عیار مبدا */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">💎 عیار مبدا (مثلاً 22)</label>
              <input
                type="number"
                step="0.01"
                value={sourceCarat}
                placeholder="مقدار پیشفرض 23.88 است"
                onChange={(e) => setSourceCarat(parseFloat(e.target.value) || 0)}
                className="w-full p-1 rounded-lg bg-gray-700 border border-gray-600 text-white"
                min={0}
                max={24}
                required
              />
            </div>

            {/* مقدار طلا (عیار 23.88) - محاسبه شده */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">مقدار طلا (عیار {STANDARD_CARAT})</label>
              <input
                type="text"
                value={goldAmount.toFixed(4)}
                readOnly
                className="w-full p-1 rounded-lg bg-gray-600 border border-gray-500 text-lg font-bold text-yellow-300"
              />
            </div>

            {/* نرخ توله */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">نرخ توله ($)</label>
              <input
                type="number"
                step="0.01"
                value={goldRate}
                onChange={(e) => setGoldRate(parseFloat(e.target.value) || 0)}
                className="w-full p-1 rounded-lg bg-gray-700 border border-gray-600 text-white"
                min={0}
                required
              />
            </div>

            {/* تاریخ و ساعت */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">📅 تاریخ و ساعت</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-1 rounded-lg bg-gray-700 border border-gray-600 text-white"
                required
              />
            </div>

            {/* پول خرید/فروش (محاسبه شده و نمایشی) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-400">
                💰 {type === "buy" ? "پول خرید" : "پول فروش"} (محاسبه شده)
              </label>
              <input
                type="text"
                value={goldPrice.toFixed(2)}
                readOnly
                className={`w-full p-1 rounded-lg bg-gray-600 border border-gray-500 text-lg font-bold ${type === "buy" ? "text-red-300" : "text-green-300"}`}
              />
            </div>

            {/* توضیحات */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-400">توضیحات / تفصیل</label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="لطفا تفصیل معاملات را وارد کنید"
                rows={1}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white h-64"
              />
            </div>

            {/* دکمه‌ها */}
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold`}
              >
                {editingTxn ? "بروزرسانی تراکنش" : "ثبت تراکنش"}
              </button>
              {editingTxn && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="py-1 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  انصراف
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* -------------------------------------------------- */}
      {/* بخش فیلترینگ و نمایش مجموع (Totals) */}
      {/* -------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-2 p-2 bg-gray-900 rounded-xl shadow-xl border border-teal-700">
        {/* کامبوباکس انتخاب بازه زمانی و فیلتر سفارشی */}
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-1 md:space-y-0 md:space-x-2 md:space-x-reverse mb-2 lg:mb-0">
          {/* کامبوباکس انتخاب بازه سریع */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <label htmlFor="timeRange" className="text-sm font-medium text-gray-400">📅 بازه:</label>
            <select
              id="timeRange"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value as TimeRange)}
              className="p-1 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-teal-500 focus:border-teal-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          {/* فیلد‌های تاریخ سفارشی (فقط زمانی که 'custom' انتخاب شود) */}
          {selectedRange === 'custom' && (
            <div className="flex items-center space-x-2 space-x-reverse border-r border-gray-600 pr-2">
              <label className="text-sm font-medium text-gray-400">از:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="p-1 rounded-lg bg-gray-700 border border-gray-600 text-white"
              />
              <label className="text-sm font-medium text-gray-400">تا:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="p-1 rounded-lg bg-gray-700 border border-gray-600 text-white"
              />
            </div>
          )}
        </div>

        {/* نمایش مجموع‌های محاسبه شده */}
        <div className="text-right text-sm grid grid-cols-2 md:grid-cols-5 gap-x-2 gap-y-1 lg:flex lg:space-x-3 lg:space-x-reverse">
          <p className="text-gray-300">خرید طلا: <span className="text-red-300">{totals.totalBuyGold.toFixed(4)}</span></p>
          <p className="text-gray-300">فروش طلا: <span className="text-green-300">{totals.totalSellGold.toFixed(4)}</span></p>
          <p className="text-gray-300">پول خرید: <span className="text-red-400">$ {totals.totalBuyPrice.toFixed(2)}</span></p>
          <p className="text-gray-300">پول فروش: <span className="text-green-400">$ {totals.totalSellPrice.toFixed(2)}</span></p>
          <p className={`font-bold text-lg ${netProfitLoss >= 0 ? 'text-teal-400' : 'text-red-500'}`}>
            {netProfitLoss >= 0 ? '✅ مفاد: ' : '❌ ضرر: '}
            $ {profitLossValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* جدول نمایش تراکنش‌ها */}
      {/* -------------------------------------------------- */}
      <Card className="rounded-xl overflow-hidden bg-gray-800 p-3 shadow-xl border border-teal-700">
        <CardHeader>
          <h3 className="text-2xl font-bold border-b border-gray-700 pb-1">جدول معاملات</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-6 text-teal-400">🔄 در حال بارگیری...</div>
          ) : extendedTransactions.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700 border-collapse">
                <thead className="bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className={headerClasses + " border-r border-gray-700"}>ID</th>
                    <th className={headerClasses}>تاریخ (هجری شمسی)</th>
                    <th className={headerClasses}>مشتری</th>
                    <th className={headerClasses}>وزن (گرم)</th>
                    <th className={headerClasses}>عیار مبدا</th>
                    <th className={headerClasses}>نوع معامله</th>
                    <th className={headerClasses}>نرخ توله ($)</th>
                    <th className={headerClasses}>مقدار خرید (عیار {STANDARD_CARAT})</th>
                    <th className={headerClasses}>مقدار فروش (عیار {STANDARD_CARAT})</th>
                    <th className={headerClasses}>پول خرید ($)</th>
                    <th className={headerClasses}>پول فروش ($)</th>
                    <th className={headerClasses}>بیلانس طلا (عیار {STANDARD_CARAT})</th>
                    <th className={headerClasses}>لیبل</th>
                    <th className={headerClasses}>تفصیل</th>
                    <th className={headerClasses}>عملیات</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {currentTransactions.map((txn) => (
                    <tr key={txn.txn_id} className="hover:bg-gray-700 transition-colors">
                      <td className={baseClasses + " border-r"}>{txn.txn_id}</td>
                      <td className={baseClasses}>{txn.created_at_jalali || new Date(txn.date).toLocaleString("fa-AF", { timeZone: "Asia/Kabul" })}</td>
                      <td className={baseClasses}>{getCustomerName(txn.customer_id)}</td>
                      <td className={baseClasses}>{txn.weight?.toFixed(4) || '-'}</td>
                      <td className={baseClasses}>{txn.source_carat?.toFixed(2) || '-'}</td>
                      <td className={baseClasses}>
                        <span className={`font-bold ${txn.type === 'buy' ? 'text-red-400' : 'text-green-400'}`}>
                          {txn.type === 'buy' ? 'خرید' : 'فروش'}
                        </span>
                      </td>
                      <td className={baseClasses}>{txn.goldRateTxn.toFixed(2)}</td>
                      <td className={baseClasses + " text-red-300"}>{txn.buyGold.toFixed(4)}</td>
                      <td className={baseClasses + " text-green-300"}>{txn.sellGold.toFixed(4)}</td>
                      <td className={baseClasses + " text-red-400"}>{txn.buyPrice.toFixed(2)}</td>
                      <td className={baseClasses + " text-green-400"}>{txn.sellPrice.toFixed(2)}</td>
                      <td className={`${baseClasses} font-bold ${txn.label === "اضافی" ? "text-red-400" : "text-green-400"}`}>
                        {txn.goldBalance.toFixed(4)}
                      </td>
                      <td className={`${baseClasses} font-bold ${txn.label === "اضافی" ? "text-red-400" : "text-green-400"}`}>
                        {txn.label}
                      </td>
                      <td className={baseClasses + " whitespace-normal"}>{txn.detail || '-'}</td>
                      <td className={baseClasses + " text-right border-r-0"}>
                        <button onClick={() => handleEdit(txn)} className="text-indigo-400 hover:text-indigo-600 mr-2">ویرایش</button>
                        <button onClick={() => handleDelete(txn.txn_id)} className="text-red-400 hover:text-red-600">حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-2">هیچ تراکنشی در این بازه زمانی یافت نشد.</p>
          )}
          {/* -------------------------------------------------- */}
          {/* کنترل‌های Pagination */}
          {/* -------------------------------------------------- */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-2 p-1 rounded-xl border border-gray-700">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                ◀️ قبلی
              </button>
              <span className="text-gray-300">
                صفحه {currentPage} از {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                بعدی ▶️
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}