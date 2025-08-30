"use client";
import React, { useEffect, useState } from "react";
/*
import {
  fetchTransactions as apiFetchTransactions,
  createTransaction as apiCreateTransaction,
  updateTransaction as apiUpdateTransaction,
  deleteTransaction as apiDeleteTransaction,
  Transaction,
} from "../../services/transactions_api";  // بعدا میسازیمش

*/
import { fetchCustomers } from "../../services/customers_api";
import { fetchEmployees } from "../../services/api";
import { fetchGoldTypes } from "../../services/goldtypes_api";

import { Card, CardHeader, CardContent } from "./ui/card";

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState<Transaction>({
    customer_id: 0,
    employee_id: 0,
    gold_type_id: 0,
    grams: 0,
    rate_per_gram: 0,
    total_usd: 0,
    notes: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [goldTypes, setGoldTypes] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadOptions();
  }, []);

  const loadData = async () => {
    try {
      const data = await apiFetchTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOptions = async () => {
    try {
      setCustomers(await fetchCustomers());
      setEmployees(await fetchEmployees());
      setGoldTypes(await fetchGoldTypes());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiUpdateTransaction(editingId, form);
        setEditingId(null);
      } else {
        await apiCreateTransaction(form);
      }
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setForm({
      customer_id: 0,
      employee_id: 0,
      gold_type_id: 0,
      grams: 0,
      rate_per_gram: 0,
      total_usd: 0,
      notes: "",
    });
  };

  const handleEdit = (t: Transaction) => {
    setForm(t);
    setEditingId(t.txn_id || null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا مطمئن هستید؟")) return;
    try {
      await apiDeleteTransaction(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name.includes("id") ? Number(value) : value });
  };

  return (
    <Card className="p-4">
      <CardHeader>
        <h2 className="text-xl font-bold">مدیریت تراکنش‌ها</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-2 mb-4">
          <select
            name="customer_id"
            value={form.customer_id}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          >
            <option value={0}>انتخاب مشتری</option>
            {customers.map((c) => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.full_name}
              </option>
            ))}
          </select>

          <select
            name="employee_id"
            value={form.employee_id}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          >
            <option value={0}>انتخاب کارمند</option>
            {employees.map((e) => (
              <option key={e.employee_id} value={e.employee_id}>
                {e.full_name}
              </option>
            ))}
          </select>

          <select
            name="gold_type_id"
            value={form.gold_type_id}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          >
            <option value={0}>انتخاب نوع طلا</option>
            {goldTypes.map((g) => (
              <option key={g.gold_type_id} value={g.gold_type_id}>
                {g.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="grams"
            placeholder="وزن (گرم)"
            value={form.grams}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          <input
            type="number"
            name="rate_per_gram"
            placeholder="نرخ هر گرم"
            value={form.rate_per_gram}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          <input
            type="number"
            name="total_usd"
            placeholder="مبلغ کل (USD)"
            value={form.total_usd}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          <input
            type="text"
            name="notes"
            placeholder="توضیحات"
            value={form.notes || ""}
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editingId ? "ویرایش تراکنش" : "ثبت تراکنش"}
          </button>
        </form>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>ID</th>
              <th>مشتری</th>
              <th>کارمند</th>
              <th>نوع طلا</th>
              <th>گرم</th>
              <th>نرخ</th>
              <th>کل (USD)</th>
              <th>توضیحات</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center p-2">
                  هیچ تراکنشی ثبت نشده است
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.txn_id}>
                  <td>{t.txn_id}</td>
                  <td>{customers.find((c) => c.customer_id === t.customer_id)?.full_name}</td>
                  <td>{employees.find((e) => e.employee_id === t.employee_id)?.full_name}</td>
                  <td>{goldTypes.find((g) => g.gold_type_id === t.gold_type_id)?.name}</td>
                  <td>{t.grams}</td>
                  <td>{t.rate_per_gram}</td>
                  <td>{t.total_usd}</td>
                  <td>{t.notes}</td>
                  <td>
                    <button onClick={() => handleEdit(t)} className="text-blue-500">
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(t.txn_id!)}
                      className="text-red-500 ml-2"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default Transactions;
