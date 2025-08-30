"use client";
import React, { useEffect, useState } from "react";
import {
  fetchExpenses as apiFetchExpenses,
  createExpense as apiCreateExpense,
  updateExpense as apiUpdateExpense,
  deleteExpense as apiDeleteExpense,
  Expense,
} from "../../services/expenses_api";

import { fetchEmployees } from "../../services/employees_api";
import { Card, CardHeader, CardContent } from "./ui/card";

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState<Expense>({
    expense_id: 0,
    employee_id: 0,
    description: "",
    amount_usd: 0,
    date: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadEmployees();
  }, []);

  const loadData = async () => {
    try {
      const data = await apiFetchExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEmployees = async () => {
    try {
      setEmployees(await fetchEmployees());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiUpdateExpense(editingId, form);
        setEditingId(null);
      } else {
        await apiCreateExpense(form);
      }
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setForm({
      expense_id: 0,
      employee_id: 0,
      description: "",
      amount_usd: 0,
      date: "",
    });
  };

  const handleEdit = (e: Expense) => {
    setForm(e);
    setEditingId(e.expense_id || null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا مطمئن هستید؟")) return;
    try {
      await apiDeleteExpense(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "employee_id" || name === "amount_usd" ? Number(value) : value });
  };

  return (
    <Card className="p-4">
      <CardHeader>
        <h2 className="text-xl font-bold">مدیریت هزینه‌ها</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-2 mb-4">
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

          <input
            type="text"
            name="description"
            placeholder="توضیحات"
            value={form.description}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          <input
            type="number"
            name="amount_usd"
            placeholder="مبلغ (USD)"
            value={form.amount_usd}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editingId ? "ویرایش هزینه" : "ثبت هزینه"}
          </button>
        </form>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>ID</th>
              <th>کارمند</th>
              <th>توضیحات</th>
              <th>مبلغ (USD)</th>
              <th>تاریخ</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-2">
                  هیچ هزینه‌ای ثبت نشده است
                </td>
              </tr>
            ) : (
              expenses.map((ex) => (
                <tr key={ex.expense_id}>
                  <td>{ex.expense_id}</td>
                  <td>{employees.find((e) => e.employee_id === ex.employee_id)?.full_name}</td>
                  <td>{ex.description}</td>
                  <td>{ex.amount_usd}</td>
                  <td>{ex.date}</td>
                  <td>
                    <button onClick={() => handleEdit(ex)} className="text-blue-500">
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(ex.expense_id!)}
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

export default Expenses;
