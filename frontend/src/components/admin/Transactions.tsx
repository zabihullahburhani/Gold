// نویسنده: ذبیح الله برهانی
// متخصص ICT, AI و رباتیک
// شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
// آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { createTransaction, fetchTransactions } from "../../services/transaction_api";

// Assume these interfaces exist from other parts of the system
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
  employee_id: number;
  gold_type_id: number;
  grams: number;
  rate_per_gram_usd: number;
  rate_per_gram_afn: number;
  total_usd: number;
  total_afn: number;
  txn_date: string;
  notes?: string;
}

// Dummy data for example purposes, replace with actual API calls
const fetchCustomers = async (): Promise<Customer[]> => {
  return [
    { customer_id: 1, full_name: "محمد احمدی" },
    { customer_id: 2, full_name: "فاطمه حسینی" },
    { customer_id: 3, full_name: "ذبیح الله برهانی" },
  ];
};

const fetchGoldTypes = async (): Promise<GoldType[]> => {
  return [
    { gold_type_id: 1, name: "طلای ۱۸ عیار" },
    { gold_type_id: 2, name: "طلای ۲۱ عیار" },
  ];
};

export default function Transactions() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [goldTypes, setGoldTypes] = useState<GoldType[]>([]);

  // Form state
  const [customerId, setCustomerId] = useState<number | string>("");
  const [goldTypeId, setGoldTypeId] = useState<number | string>("");
  const [grams, setGrams] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [ratePerGramAfn, setRatePerGramAfn] = useState<number>(0);
  const [totalAfn, setTotalAfn] = useState<number>(0);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (token) {
          const [txnData, customerData, goldTypeData] = await Promise.all([
            fetchTransactions(token),
            fetchCustomers(),
            fetchGoldTypes(),
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
    };
    loadInitialData();
  }, [token]);
  
  // A simple effect to recalculate total AFN based on grams and rate
  useEffect(() => {
    setTotalAfn(grams * ratePerGramAfn);
  }, [grams, ratePerGramAfn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!token) throw new Error("Authentication token not found.");
      const transactionData = {
        customer_id: Number(customerId),
        gold_type_id: Number(goldTypeId),
        grams,
        rate_per_gram_usd: ratePerGramAfn / 78.5, // Dummy conversion rate
        rate_per_gram_afn: ratePerGramAfn,
        total_usd: totalAfn / 78.5,
        total_afn: totalAfn,
        notes,
      };
      await createTransaction(token, transactionData);
      
      // Clear form
      setCustomerId("");
      setGoldTypeId("");
      setGrams(0);
      setNotes("");
      setRatePerGramAfn(0);
      
      // Reload transactions
      const updatedTransactions = await fetchTransactions(token);
      setTransactions(updatedTransactions);

    } catch (err) {
      console.error("Failed to save transaction:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const getCustomerName = (id: number) => {
    const customer = customers.find(c => c.customer_id === id);
    return customer ? customer.full_name : "نامشخص";
  };
  
  const getGoldTypeName = (id: number) => {
    const goldType = goldTypes.find(gt => gt.gold_type_id === id);
    return goldType ? goldType.name : "نامشخص";
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen font-inter">
      <h1 className="text-3xl font-bold text-center text-teal-400">
        💰 مدیریت تراکنش‌ها
      </h1>

      <div className="rounded-xl overflow-hidden bg-gray-800 p-6 shadow-xl border border-teal-700">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">ثبت تراکنش جدید</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
              👤 مشتری
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-teal-500 transition-all"
              required
            >
              <option value="">یک مشتری انتخاب کنید</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>{c.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
              💎 نوع طلا
            </label>
            <select
              value={goldTypeId}
              onChange={(e) => setGoldTypeId(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-teal-500 transition-all"
              required
            >
              <option value="">یک نوع طلا انتخاب کنید</option>
              {goldTypes.map((gt) => (
                <option key={gt.gold_type_id} value={gt.gold_type_id}>{gt.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-400">گرم</label>
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(parseFloat(e.target.value) || 0)}
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-all"
              placeholder="مقدار گرم"
              min="0"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-400">نرخ (افغانی)</label>
            <input
              type="number"
              value={ratePerGramAfn}
              onChange={(e) => setRatePerGramAfn(parseFloat(e.target.value) || 0)}
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-all"
              placeholder="نرخ هر گرم به افغانی"
              min="0"
              required
            />
          </div>
          <div className="md:col-span-2 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h4 className="text-lg font-semibold mb-2">مجموع محاسبه شده</h4>
            <p className="text-xl font-bold flex items-center gap-2 text-green-400">
              💵 {totalAfn.toFixed(2)} افغانی
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-400">توضیحات</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-all"
              placeholder="یادداشت‌های مربوط به تراکنش"
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className={`w-full md:col-span-2 py-3 rounded-lg transition-all duration-300 ${
              isSaving ? 'bg-teal-800 animate-pulse cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
            } text-white font-semibold flex items-center justify-center gap-2`}
          >
            {isSaving ? (
              <>
                🔄
                <span>در حال ثبت...</span>
              </>
            ) : (
              <>
                ➕
                <span>ثبت تراکنش</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-xl overflow-hidden bg-gray-800 p-6 shadow-xl border border-teal-700">
        <h3 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">تاریخچه تراکنش‌ها</h3>
        {loading ? (
          <div className="flex justify-center items-center py-12 text-teal-400">
            🔄
            <p className="mr-3 text-lg">در حال بارگیری...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">کد تراکنش</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">مشتری</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">نوع طلا</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">گرم</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">نرخ (افغانی)</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">مجموع (افغانی)</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">تاریخ</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {transactions.map((txn) => (
                  <tr key={txn.txn_id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{txn.txn_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getCustomerName(txn.customer_id)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getGoldTypeName(txn.gold_type_id)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{txn.grams.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{txn.rate_per_gram_afn.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">{txn.total_afn.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(txn.txn_date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-4">هنوز هیچ تراکنشی ثبت نشده است.</p>
        )}
      </div>
    </div>
  );
}
