// نویسنده: ذبیح الله برهانی
// متخصص ICT, AI و رباتیک
// شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
// آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";

import { 
  createTransaction, 
  fetchTransactions, 
  updateTransaction, 
  deleteTransaction } from "../../services/transaction_api";

import { fetchCustomers } from "../../services/customers_api";
import { fetchEmployees } from "../../services/api";
import { fetchGoldTypes } from "../../services/goldtypes_api";

// Assuming these interfaces exist or are created
interface Customer {
  customer_id: number;
  full_name: string;
}

interface Employee {
  employee_id: number;
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

export default function Transactions() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [goldTypes, setGoldTypes] = useState<GoldType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);

  // Form state
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [goldTypeId, setGoldTypeId] = useState<number | ''>('');
  const [grams, setGrams] = useState<number>(0);
  const [ratePerGramAfn, setRatePerGramAfn] = useState<number>(0);
  const [ratePerGramUsd, setRatePerGramUsd] = useState<number>(0);
  const [totalAfn, setTotalAfn] = useState<number>(0);
  const [totalUsd, setTotalUsd] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const loadData = useCallback(async () => {
    try {
      if (token) {
        const [
          txnData,
          customerData,
          employeeData,
          goldTypeData,
          
        ] = await Promise.all([
          fetchTransactions(token),
          fetchCustomers(token),
          fetchEmployees(token),
          fetchGoldTypes(token),
        ]);
        setTransactions(txnData);
        setFilteredTransactions(txnData);
        setCustomers(customerData);
        setEmployees(employeeData);
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

  // Recalculate totals on input change
  useEffect(() => {
    setTotalAfn(grams * ratePerGramAfn);
    setTotalUsd(grams * ratePerGramUsd);
  }, [grams, ratePerGramAfn, ratePerGramUsd]);

  useEffect(() => {
    const results = transactions.filter(txn =>
      getCustomerName(txn.customer_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getEmployeeName(txn.employee_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getGoldTypeName(txn.gold_type_id).toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(results);
  }, [searchTerm, transactions]);

  const clearForm = () => {
    setEditingTxn(null);
    setCustomerId('');
    setEmployeeId('');
    setGoldTypeId('');
    setGrams(0);
    setRatePerGramAfn(0);
    setRatePerGramUsd(0);
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!token) throw new Error("Authentication token not found.");
      const data = {
        customer_id: Number(customerId),
        employee_id: Number(employeeId),
        gold_type_id: Number(goldTypeId),
        grams,
        rate_per_gram_usd: ratePerGramUsd,
        rate_per_gram_afn: ratePerGramAfn,
        total_usd: totalUsd,
        total_afn: totalAfn,
        notes,
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
    setEmployeeId(txn.employee_id);
    setGoldTypeId(txn.gold_type_id);
    setGrams(txn.grams);
    setRatePerGramUsd(txn.rate_per_gram_usd);
    setRatePerGramAfn(txn.rate_per_gram_afn);
    setNotes(txn.notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("آیا از حذف این تراکنش مطمئن هستید؟")) {
      try {
        if (!token) throw new Error("Authentication token not found.");
        await deleteTransaction(token, id);
        await loadData();
      } catch (err) {
        console.error("Failed to delete transaction:", err);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };
  
  const getCustomerName = (id: number) => customers.find(c => c.customer_id === id)?.full_name || "نامشخص";
  const getEmployeeName = (id: number) => employees.find(e => e.employee_id === id)?.full_name || "نامشخص";
  const getGoldTypeName = (id: number) => goldTypes.find(gt => gt.gold_type_id === id)?.name || "نامشخص";

  return (
    <div className="p-6 space-y-8 bg-gray-900 text-white min-h-screen font-inter">
      <Card className="rounded-xl overflow-hidden bg-gray-800 p-6 shadow-xl border border-teal-700">
        <CardHeader>
          <h1 className="text-3xl font-bold text-center text-teal-400">💰 مدیریت تراکنش‌ها</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
                👤 مشتری
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(parseInt(e.target.value) || '')}
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
                👨‍💼 کارمند
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(parseInt(e.target.value) || '')}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-teal-500 transition-all"
                required
              >
                <option value="">یک کارمند انتخاب کنید</option>
                {employees.map((e) => (
                  <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-400">
                💎 نوع طلا
              </label>
              <select
                value={goldTypeId}
                onChange={(e) => setGoldTypeId(parseInt(e.target.value) || '')}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-teal-500 transition-all"
                required
              >
                <option value="">یک نوع طلا انتخاب کنید</option>
                {goldTypes.map((gt) => (
                  <option key={gt.gold_type_id} value={gt.gold_type_id}>{gt.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">گرم طلا</label>
              <input
                type="number"
                value={grams}
                onChange={(e) => setGrams(parseFloat(e.target.value))}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-all"
                placeholder="مقدار گرم"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">نرخ (افغانی)</label>
              <input
                type="number"
                value={ratePerGramAfn}
                onChange={(e) => setRatePerGramAfn(parseFloat(e.target.value))}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-all"
                placeholder="نرخ هر گرم به افغانی"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">نرخ (دالر)</label>
              <input
                type="number"
                value={ratePerGramUsd}
                onChange={(e) => setRatePerGramUsd(parseFloat(e.target.value))}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-all"
                placeholder="نرخ هر گرم به دالر"
                required
              />
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
            <div className="md:col-span-2 p-4 bg-gray-700 rounded-lg border border-gray-600">
              <h4 className="text-lg font-semibold mb-2">مجموع محاسبه شده</h4>
              <p className="text-xl font-bold flex items-center gap-2 text-green-400 mb-2">
                💵 {totalUsd.toFixed(2)} دالر
              </p>
              <p className="text-xl font-bold flex items-center gap-2 text-green-400">
                💰 {totalAfn.toFixed(2)} افغانی
              </p>
            </div>
            <div className="md:col-span-2 flex justify-end gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-3 rounded-lg transition-all duration-300 ${
                  isSaving ? 'bg-teal-800 animate-pulse cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                } text-white font-semibold flex items-center justify-center gap-2`}
              >
                {isSaving ? (
                  <>
                    🔄 <span>در حال ذخیره...</span>
                  </>
                ) : (
                  <>
                    ✅ <span>{editingTxn ? "بروزرسانی تراکنش" : "ثبت تراکنش"}</span>
                  </>
                )}
              </button>
              {editingTxn && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="py-3 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                >
                  انصراف
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card className="rounded-xl overflow-hidden bg-gray-800 p-6 shadow-xl border border-teal-700">
        <CardHeader>
          <h3 className="text-2xl font-bold border-b border-gray-700 pb-2">تاریخچه تراکنش‌ها</h3>
          <div className="flex justify-between items-center mt-4 mb-4">
            <input
              type="text"
              placeholder="جستجو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/2 p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-all"
            />
            <button
              onClick={handlePrint}
              className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center gap-2"
            >
              🖨️ پرینت
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12 text-teal-400">
              🔄 <span className="mr-3 text-lg">در حال بارگیری...</span>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">مشتری</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">کارمند</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">نوع طلا</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">گرم</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">مجموع (افغانی)</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">مجموع (دالر)</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">تاریخ</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">عملیات</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.txn_id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getCustomerName(txn.customer_id)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getEmployeeName(txn.employee_id)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getGoldTypeName(txn.gold_type_id)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{txn.grams.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">{txn.total_afn.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">{txn.total_usd.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(txn.txn_date).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(txn)}
                          className="text-indigo-400 hover:text-indigo-600 transition-colors mr-2"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(txn.txn_id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          🗑️
                        </button>
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
