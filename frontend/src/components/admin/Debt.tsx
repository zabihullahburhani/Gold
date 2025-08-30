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
  employee_id: number;
  amount_usd: number;
  description: string;
  created_at: string;
}

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [newDebt, setNewDebt] = useState({
    customer_id: 0,
    employee_id: 0,
    amount_usd: 0,
    description: "",
  });

  const loadDebts = async () => {
    const data = await apiFetchDebts();
    setDebts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadDebts();
  }, []);

  const handleCreate = async () => {
    await apiCreateDebt(newDebt);
    setNewDebt({ customer_id: 0, employee_id: 0, amount_usd: 0, description: "" });
    loadDebts();
  };

  const handleDelete = async (id: number) => {
    await apiDeleteDebt(id);
    loadDebts();
  };

  return (
    <Card>
      <CardHeader>مدیریت بدهی‌ها</CardHeader>
      <CardContent>
        {/* فرم افزودن بدهی جدید */}
        <div className="space-y-2">
          <input
            type="number"
            placeholder="کد مشتری"
            value={newDebt.customer_id}
            onChange={(e) => setNewDebt({ ...newDebt, customer_id: Number(e.target.value) })}
            className="border p-1 text-black"
          />
          <input
            type="number"
            placeholder="کد کارمند"
            value={newDebt.employee_id}
            onChange={(e) => setNewDebt({ ...newDebt, employee_id: Number(e.target.value) })}
            className="border p-1 text-black"
          />
          <input
            type="number"
            placeholder="مبلغ (USD)"
            value={newDebt.amount_usd}
            onChange={(e) => setNewDebt({ ...newDebt, amount_usd: Number(e.target.value) })}
            className="border p-1 text-black"
          />
          <input
            type="text"
            placeholder="توضیحات"
            value={newDebt.description}
            onChange={(e) => setNewDebt({ ...newDebt, description: e.target.value })}
            className="border p-1 text-black"
          />
          <button
            onClick={handleCreate}
            className="bg-yellow-500 text-black p-2 rounded"
          >
            ثبت بدهی
          </button>
        </div>

        {/* جدول نمایش بدهی‌ها */}
        <table className="w-full mt-4 border text-yellow-400">
          <thead>
            <tr>
              <th>کد بدهی</th>
              <th>مشتری</th>
              <th>کارمند</th>
              <th>مبلغ ($)</th>
              <th>توضیحات</th>
              <th>تاریخ</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {debts.map((d) => (
              <tr key={d.debt_id}>
                <td>{d.debt_id}</td>
                <td>{d.customer_id}</td>
                <td>{d.employee_id}</td>
                <td>{d.amount_usd}</td>
                <td>{d.description}</td>
                <td>{new Date(d.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleDelete(d.debt_id)}
                    className="text-red-500"
                  >
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
