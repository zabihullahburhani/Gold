"use client";
import React, { useEffect, useState } from "react";
import {
  fetchTransactions as apiFetchTransactions,
  createTransaction as apiCreateTransaction,
  updateTransaction as apiUpdateTransaction,
  deleteTransaction as apiDeleteTransaction,
} from "../../services/transactions_api";
import { Card, CardHeader, CardContent } from "./ui/card";

interface Transaction {
  transaction_id: number;
  customer_id: number;
  gold_type_id: number;
  weight_grams: number;
  price_usd: number;
  price_afn: number;
  created_at: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTx, setNewTx] = useState({
    customer_id: 0,
    gold_type_id: 0,
    weight_grams: 0,
    price_usd: 0,
    price_afn: 0,
  });

  const loadData = async () => {
    const data = await apiFetchTransactions();
    setTransactions(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    await apiCreateTransaction(newTx);
    setNewTx({ customer_id: 0, gold_type_id: 0, weight_grams: 0, price_usd: 0, price_afn: 0 });
    loadData();
  };

  const handleDelete = async (id: number) => {
    await apiDeleteTransaction(id);
    loadData();
  };

  return (
    <Card>
      <CardHeader>مدیریت معاملات</CardHeader>
      <CardContent>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="کد مشتری"
            value={newTx.customer_id}
            onChange={(e) => setNewTx({ ...newTx, customer_id: parseInt(e.target.value) })}
            className="border p-1 text-black"
          />
          <input
            type="number"
            placeholder="کد نوعیت طلا"
            value={newTx.gold_type_id}
            onChange={(e) => setNewTx({ ...newTx, gold_type_id: parseInt(e.target.value) })}
            className="border p-1 text-black"
          />
          <input
            type="number"
            placeholder="وزن (گرام)"
            value={newTx.weight_grams}
            onChange={(e) => setNewTx({ ...newTx, weight_grams: parseFloat(e.target.value) })}
            className="border p-1 text-black"
          />
          <input
            type="number"
            placeholder="قیمت (دالر)"
            value={newTx.price_usd}
            onChange={(e) => setNewTx({ ...newTx, price_usd: parseFloat(e.target.value) })}
            className="border p-1 text-black"
          />
          <input
            type="number"
            placeholder="قیمت (افغانی)"
            value={newTx.price_afn}
            onChange={(e) => setNewTx({ ...newTx, price_afn: parseFloat(e.target.value) })}
            className="border p-1 text-black"
          />
          <button onClick={handleCreate} className="bg-yellow-500 p-2 rounded text-black">
            ثبت معامله
          </button>
        </div>

        <table className="w-full mt-4 border text-yellow-400">
          <thead>
            <tr>
              <th>کد</th>
              <th>مشتری</th>
              <th>نوع طلا</th>
              <th>وزن (g)</th>
              <th>قیمت $</th>
              <th>قیمت AFN</th>
              <th>تاریخ</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.transaction_id}>
                <td>{t.transaction_id}</td>
                <td>{t.customer_id}</td>
                <td>{t.gold_type_id}</td>
                <td>{t.weight_grams}</td>
                <td>{t.price_usd}</td>
                <td>{t.price_afn}</td>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(t.transaction_id)} className="text-red-500">
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
