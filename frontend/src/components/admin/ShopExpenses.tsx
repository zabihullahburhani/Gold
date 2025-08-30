"use client";
import React, { useEffect, useState } from "react";
import {
  fetchExpenses as apiFetchExpenses,
  createExpense as apiCreateExpense,
  updateExpense as apiUpdateExpense,
  deleteExpense as apiDeleteExpense,
} from "../../services/shop_expenses_api";
import { Card, CardHeader, CardContent } from "./ui/card";

interface Expense {
  expense_id: number;
  description: string;
  amount_usd: number;
  amount_afn: number;
  created_at: string;
}

export default function ShopExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount_usd: 0,
    amount_afn: 0,
  });

  const loadData = async () => {
    const data = await apiFetchExpenses();
    setExpenses(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    await apiCreateExpense(newExpense);
    setNewExpense({ description: "", amount_usd: 0, amount_afn: 0 });
    loadData();
  };

  const handleDelete = async (id: number) => {
    await apiDeleteExpense(id);
    loadData();
  };

  return (
    <Card>
      <CardHeader>مدیریت مصارف دکان</CardHeader>
      <CardContent>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="توضیحات"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            className="border p-1 text-black"
          />
          <input
            type="number"
            placeholder="مقدار مصرف (دالر)"
            value={newExpense.amount_usd}
            onChange={(e) => setNewExpense({ ...newExpense, amount_usd: parseFloat(e.target.value) })}
            className="border p-1 text-black"
          />
          <input
            type="number"
            placeholder="مقدار مصرف (افغانی)"
            value={newExpense.amount_afn}
            onChange={(e) => setNewExpense({ ...newExpense, amount_afn: parseFloat(e.target.value) })}
            className="border p-1 text-black"
          />
          <button onClick={handleCreate} className="bg-yellow-500 p-2 rounded text-black">
            ثبت مصرف
          </button>
        </div>

        <table className="w-full mt-4 border text-yellow-400">
          <thead>
            <tr>
              <th>کد</th>
              <th>توضیحات</th>
              <th>مصرف $</th>
              <th>مصرف AFN</th>
              <th>تاریخ</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((ex) => (
              <tr key={ex.expense_id}>
                <td>{ex.expense_id}</td>
                <td>{ex.description}</td>
                <td>{ex.amount_usd}</td>
                <td>{ex.amount_afn}</td>
                <td>{new Date(ex.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(ex.expense_id)} className="text-red-500">
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
