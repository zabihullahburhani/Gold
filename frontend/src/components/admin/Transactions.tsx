// frontend/src/components/admin/Transactions.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";

import {
  createTransaction,
  fetchTransactions,
  updateTransaction,
  deleteTransaction,
} from "../../services/transaction_api";

import { fetchCustomers } from "../../services/customers_api";
import { fetchGoldTypes } from "../../services/goldtypes_api";

interface Customer {
  customer_id: number;
  full_name: string;
}

interface GoldType {
  gold_type_id: number;
  name: string;
}

interface Transaction {
  txn_id: number;
  customer_id: number;
  gold_type_id: number;
  type: "buy" | "sell";
  dollar_balance: number;
  dollar_in: number;
  dollar_out: number;
  gold_balance: number;
  gold_in: number;
  gold_out: number;
  detail?: string;
  date: string;
  created_at?: string;
}

export default function Transactions() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers,
    // (کدهای Customers و GoldTypes و Form State بدون تغییر باقی می‌مانند)
  ] = useState<Customer[]>([]);
  const [goldTypes, setGoldTypes] = useState<GoldType[]>([]);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);

  // Form state
  const [customerId, setCustomerId] = useState<number | "">("");
  const [goldTypeId, setGoldTypeId] = useState<number | "">("");
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [dollarIn, setDollarIn] = useState<number>(0);
  const [dollarOut, setDollarOut] = useState<number>(0);
  const [goldIn, setGoldIn] = useState<number>(0);
  const [goldOut, setGoldOut] = useState<number>(0);
  const [detail, setDetail] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const loadData = useCallback(async () => {
    try {
      if (token) {
        // فرض بر این است که fetchTransactions ساختار داده صحیح را برمی‌گرداند.
        const [txnData, customerData, goldTypeData] = await Promise.all([
          fetchTransactions(token),
          fetchCustomers(token),
          fetchGoldTypes(token),
        ]);
        setTransactions(txnData);
        setCustomers(customerData);
        setGoldTypes(goldTypeData);
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

  const clearForm = () => {
    setEditingTxn(null);
    setCustomerId("");
    setGoldTypeId("");
    setType("buy");
    setDollarIn(0);
    setDollarOut(0);
    setGoldIn(0);
    setGoldOut(0);
    setDetail("");
    setDate(new Date().toISOString().slice(0, 10));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!token) throw new Error("Authentication token not found.");
      const data = {
        customer_id: Number(customerId),
        gold_type_id: Number(goldTypeId),
        type,
        dollar_in: dollarIn,
        dollar_out: dollarOut,
        gold_in: goldIn,
        gold_out: goldOut,
        dollar_balance: dollarIn - dollarOut,
        gold_balance: goldIn - goldOut,
        detail,
        date,
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
    setGoldTypeId(txn.gold_type_id);
    setType(txn.type);
    setDollarIn(txn.dollar_in);
    setDollarOut(txn.dollar_out);
    setGoldIn(txn.gold_in);
    setGoldOut(txn.gold_out);
    setDetail(txn.detail || "");
    setDate(txn.date);
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
  const getGoldTypeName = (id: number) => goldTypes.find((gt) => gt.gold_type_id === id)?.name || "نامشخص";

  // محاسبه سود/ضرر
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const profitLoss = (dateFilter: string) => {
    const filtered = transactions.filter((t) => t.date === dateFilter);
    return filtered.reduce((sum, t) => sum + (t.dollar_in - t.dollar_out), 0);
  };

  const totalDollar = transactions.reduce((sum, t) => sum + t.dollar_balance, 0);

  const baseClasses = "px-4 py-3 text-sm text-gray-300 border-b border-gray-700 border-l"; // کلاس‌های پایه برای سلول‌ها
  const headerClasses = "px-4 py-3 text-right text-xs font-medium text-gray-300 border-l border-gray-700"; // کلاس‌های پایه برای هدر

  return (
    <div className="p-6 space-y-8 bg-gray-900 text-white min-h-screen font-inter">
      {/* فرم ثبت/ویرایش تراکنش (بدون تغییر) */}
      <Card className="rounded-xl overflow-hidden bg-gray-800 p-6 shadow-xl border border-teal-700">
        <CardHeader>
          <h1 className="text-3xl font-bold text-center text-teal-400">💰 مدیریت تراکنش‌ها</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ... کدهای فرم ... */}
            {/* مشتری */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">👤 مشتری</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(parseInt(e.target.value) || "")}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
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

            {/* نوع طلا */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">💎 نوع طلا</label>
              <select
                value={goldTypeId}
                onChange={(e) => setGoldTypeId(parseInt(e.target.value) || "")}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                required
              >
                <option value="">یک نوع طلا انتخاب کنید</option>
                {goldTypes.map((gt) => (
                  <option key={gt.gold_type_id} value={gt.gold_type_id}>
                    {gt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* نوع معامله */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-400">نوع معامله</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "buy" | "sell")}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              >
                <option value="buy">خرید</option>
                <option value="sell">فروش</option>
              </select>
            </div>

            {/* فیلدهای خرید */}
            {type === "buy" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400">💵 جمع دالر </label>
                  <input
                    type="number"
                    value={dollarIn}
                    onChange={(e) => setDollarIn(parseFloat(e.target.value))}
                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400">باقی طلا </label>
                  <input
                    type="number"
                    value={goldIn}
                    onChange={(e) => setGoldIn(parseFloat(e.target.value))}
                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                    min={0}
                  />
                </div>
              </>
            )}

            {/* فیلدهای فروش */}
            {type === "sell" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400">💵 باقی دالر </label>
                  <input
                    type="number"
                    value={dollarOut}
                    onChange={(e) => setDollarOut(parseFloat(e.target.value))}
                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400">جمع طلا </label>
                  <input
                    type="number"
                    value={goldOut}
                    onChange={(e) => setGoldOut(parseFloat(e.target.value))}
                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                    min={0}
                  />
                </div>
              </>
            )}

            {/* توضیحات */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-400">توضیحات</label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={3}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              />
            </div>

            {/* دکمه‌ها */}
            <div className="md:col-span-2 flex justify-end gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold`}
              >
                {editingTxn ? "بروزرسانی تراکنش" : "ثبت تراکنش"}
              </button>
              {editingTxn && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="py-3 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  انصراف
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* خلاصه و تراکنش‌ها */}
      <Card className="rounded-xl overflow-hidden bg-gray-800 p-6 shadow-xl border border-teal-700">
        <CardHeader>
          <h3 className="text-2xl font-bold border-b border-gray-700 pb-2">خلاصه و تراکنش‌ها</h3>
          <div className="flex flex-col md:flex-row justify-between mt-4 mb-4 gap-4">
            <p>💵 مجموع دالر: {totalDollar.toFixed(2)}</p>
            <p className={profitLoss(today) >= 0 ? "text-green-400" : "text-red-400"}>
              سود/ضرر امروز: {profitLoss(today).toFixed(2)}
            </p>
            <p className={profitLoss(yesterday) >= 0 ? "text-green-400" : "text-red-400"}>
              سود/ضرر دیروز: {profitLoss(yesterday).toFixed(2)}
            </p>
            <p className={profitLoss(today) >= 0 ? "text-green-400" : "text-red-400"}>
              پیش‌بینی فردا: {(profitLoss(today) * 1.05).toFixed(2)}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12 text-teal-400">🔄 در حال بارگیری...</div>
          ) : transactions.length > 0 ? (
            
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              {/* اعمال استایل border-collapse برای نمایش تمام بوردرها */}
              <table className="min-w-full divide-y divide-gray-700 border-collapse">
                <thead className="bg-gray-700">
                  <tr>
                    {/* ستون ID تراکنش افزوده شد */}
                    <th className={headerClasses + " border-r border-gray-700"}>ID</th> 
                    <th className={headerClasses}>تاریخ</th>
                    <th className={headerClasses}>مشتری</th>
                    <th className={headerClasses}>نوع طلا</th>
                    <th className={headerClasses}>نوع معامله</th>
                    <th className={headerClasses}> جمع دالر </th>
                    <th className={headerClasses}>باقی دالر </th>
                    <th className={headerClasses}> باقی طلا</th>
                    <th className={headerClasses}>جمع طلا </th>
                    <th className={headerClasses}>بیلانس دالر</th>
                    <th className={headerClasses}>بیلانس طلا</th>
                    <th className={headerClasses}> توضیحات</th>
                    <th className={headerClasses}>عملیات</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {transactions.map((txn, index) => (
                    <tr key={txn.txn_id} className="hover:bg-gray-700 transition-colors">
                      {/* نمایش ID تراکنش */}
                      <td className={baseClasses + " border-r"}>{txn.txn_id}</td>
                      <td className={baseClasses}>{txn.date}</td>
                      <td className={baseClasses}>{getCustomerName(txn.customer_id)}</td>
                      <td className={baseClasses}>{getGoldTypeName(txn.gold_type_id)}</td>
                      <td className={baseClasses}>{txn.type}</td>
                      <td className={baseClasses}>{txn.dollar_in.toFixed(2)}</td>
                      <td className={baseClasses}>{txn.dollar_out.toFixed(2)}</td>
                      <td className={baseClasses}>{txn.gold_in.toFixed(2)}</td>
                      <td className={baseClasses}>{txn.gold_out.toFixed(2)}</td>
                      <td className={`${baseClasses} font-semibold ${txn.dollar_balance >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {txn.dollar_balance.toFixed(2)}
                      </td>
                      <td className={`${baseClasses} font-semibold ${txn.gold_balance >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {txn.gold_balance.toFixed(2)}
                      </td>
                      <td className={baseClasses + " whitespace-normal"}>
                        {txn.detail || '-'}
                      </td>
                      <td className={baseClasses + " text-right border-r-0"}> 
                        <button onClick={() => handleEdit(txn)} className="text-indigo-400 hover:text-indigo-600 mr-2">✏️</button>
                        <button onClick={() => handleDelete(txn.txn_id)} className="text-red-400 hover:text-red-600">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-4">هیچ تراکنشی یافت نشد.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}