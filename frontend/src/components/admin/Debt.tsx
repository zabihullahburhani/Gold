"use client";
import React, { useEffect, useState } from "react";
import {
  fetchDebts as apiFetchDebts,
  createDebt as apiCreateDebt,
  updateDebt as apiUpdateDebt,
  deleteDebt as apiDeleteDebt,
} from "../../services/debts_api";
import { Card, CardHeader, CardContent } from "./ui/card";

interface Debt {
  debt_id: number;
  customer_id: number;
  amount_usd: number;
  amount_afn: number;
  due_date: string;
  status: string;
  created_at: string;
}

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [newDebt, setNewDebt] = useState({
    customer_id: 0,
    amount_usd: 0,
    amount_afn: 0,
    due_date: "",
    status: "pending",
  });

  const loadData = async () => {
    const data = await apiFetchDebts();
    setDebts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    await apiCreateDebt(newDebt);
    setNewDebt({ customer_id: 0, amount_usd: 0, amount_afn: 0, due_date: "", status: "pending" });
    loadData();
  };

  const handleDelete = async (id: number) => {
    await apiDeleteDebt(id);
    loadData();
  };

  return (
    <Card>
      <CardHeader>مدیریت بدهی‌ها</CardHeader>
      <CardContent>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="کد مشتری"
            value={newDebt.customer_id}
            onChange={(e) => setNewDebt({ ...newDebt, customer_id: parseInt(e.target.value) })}
            className="border p-1 text-black"
          />
          <input
            type="number"
            placeholder="مقدار بدهی (دالر)"
            value={newDebt.amount_usd}
            onChange={(e) => setNewDebt({ ...newDebt, amount_usd: parseFloat(e.target.value) })}
            className="border p-1 text-black"
          />
          <input
            type="number"
            placeholder="مقدار بدهی (افغانی)"
            value={newDebt.amount_afn}
            onChange={(e) => setNewDebt({ ...newDebt, amount_afn: parseFloat(e.target.value) })}
            className="border p-1 text-black"
          />
          <input
            type="date"
            value={newDebt.due_date}
            onChange={(e) => setNewDebt({ ...newDebt, due_date: e.target.value })}
            className="border p-1 text-black"
          />
          <select
            value={newDebt.status}
            onChange={(e) => setNewDebt({ ...newDebt, status: e.target.value })}
            className="border p-1 text-black"
          >
            <option value="pending">در حال پرداخت</option>
            <option value="paid">پرداخت شده</option>
          </select>
          <button onClick={handleCreate} className="bg-yellow-500 p-2 rounded text-black">
            ثبت بدهی
          </button>
        </div>

        <table className="w-full mt-4 border text-yellow-400">
          <thead>
            <tr>
              <th>کد</th>
              <th>مشتری</th>
              <th>مقدار $</th>
              <th>مقدار AFN</th>
              <th>تاریخ سررسید</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {debts.map((d) => (
              <tr key={d.debt_id}>
                <td>{d.debt_id}</td>
                <td>{d.customer_id}</td>
                <td>{d.amount_usd}</td>
                <td>{d.amount_afn}</td>
                <td>{new Date(d.due_date).toLocaleDateString()}</td>
                <td>{d.status}</td>
                <td>
                  <button onClick={() => handleDelete(d.debt_id)} className="text-red-500">
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
