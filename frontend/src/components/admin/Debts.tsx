// path: frontend/src/components/admin/Debts.tsx
"use client";

import React, { useEffect, useState } from "react";
import { fetchDebts, createDebt, deleteDebt } from "../../services/debts_api";
import { fetchCustomers } from "../../services/customers_api";
import { fetchEmployees } from "../../services/api"; 
import { Card, CardHeader, CardContent } from "./ui/card";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



interface Debt {
  debt_id: number;
  customer_id: number;
  employee_id: number;
  gold_grams: number;
  tola: number;
  usd: number;
  afn: number;
  notes?: string;
  is_paid: boolean;
  created_at: string;
}

interface Customer {
  customer_id: number;
  full_name: string;
}

interface Employee {
  employee_id: number;
  full_name: string;
}

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newDebt, setNewDebt] = useState({
    customer_id: 0,
    employee_id: 0,
    gold_grams: 0,
    tola: 0,
    usd: 0,
    afn: 0,
    notes: "",
    is_paid: false,
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const loadData = async () => {
    if (!token) return;
    try {
      const [debtsData, customersData, employeesResponse] = await Promise.all([
        fetchDebts(token),
        fetchCustomers(token, ""),
        fetchEmployees(token),
      ]);

      setDebts(debtsData);
      setCustomers(customersData);
      setEmployees(employeesResponse.data || employeesResponse);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!token) return;
    try {
      await createDebt(newDebt, token);
      setNewDebt({
        customer_id: 0,
        employee_id: 0,
        gold_grams: 0,
        tola: 0,
        usd: 0,
        afn: 0,
        notes: "",
        is_paid: false,
      });
      loadData();
    } catch (error) {
      console.error("Failed to create debt:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await deleteDebt(id, token);
      loadData();
    } catch (error) {
      console.error("Failed to delete debt:", error);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("گزارش بدهی‌ها", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["کد", "مشتری", "کارمند", "گرام", "توله", "دالر", "افغانی", "یادداشت"]],
      body: debts.map((d) => [
        d.debt_id,
        customers.find((c) => c.customer_id === d.customer_id)?.full_name || "ناشناخته",
        employees.find((e) => e.employee_id === d.employee_id)?.full_name || "ناشناخته",
        d.gold_grams,
        d.tola,
        d.usd,
        d.afn,
        d.notes || "-",
      ]),
      styles: { font: "helvetica", fontSize: 9 },
      headStyles: { fillColor: [255, 215, 0], textColor: 0 },
    });

    doc.save("debts_report.pdf");
  };

  return (
    <Card className="bg-black text-yellow-400 border border-yellow-500 rounded-xl">
      <CardHeader className="text-base font-bold flex justify-between items-center">
        <span>مدیریت بدهی‌ها</span>
        <div className="flex gap-1">
          <button onClick={handleExportPDF}
            className="bg-yellow-600 text-black px-2 py-1 rounded hover:bg-yellow-500 text-xs"
          >
            گزارش‌گیری (PDF)
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* فرم افزودن بدهی */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 mb-2 text-sm min-w-0">
          <div className="min-w-0">
            <label className="block mb-0.5 text-xs">مشتری:</label>
            <select
              value={newDebt.customer_id}
              onChange={(e) =>
                setNewDebt({ ...newDebt, customer_id: parseInt(e.target.value) })
              }
              className="w-full p-0.5 text-black text-sm rounded"
            >
              <option value="">انتخاب مشتری</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-0.5 text-xs">کارمند:</label>
            <select
              value={newDebt.employee_id}
              onChange={(e) =>
                setNewDebt({ ...newDebt, employee_id: parseInt(e.target.value) })
              }
              className="w-full p-0.5 text-black text-sm rounded"
            >
              <option value="">انتخاب کارمند</option>
              {employees.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-0.5 text-xs">گرام:</label>
            <input
              type="number"
              value={newDebt.gold_grams}
              onChange={(e) =>
                setNewDebt({ ...newDebt, gold_grams: parseFloat(e.target.value) || 0 })
              }
              className="w-full p-0.5 text-black text-sm rounded"
            />
          </div>

          <div>
            <label className="block mb-0.5 text-xs">توله:</label>
            <input
              type="number"
              value={newDebt.tola}
              onChange={(e) =>
                setNewDebt({ ...newDebt, tola: parseFloat(e.target.value) || 0 })
              }
              className="w-full p-0.5 text-black text-sm rounded"
            />
          </div>

          <div>
            <label className="block mb-0.5 text-xs">دالر:</label>
            <input
              type="number"
              value={newDebt.usd}
              onChange={(e) =>
                setNewDebt({ ...newDebt, usd: parseFloat(e.target.value) || 0 })
              }
              className="w-full p-0.5 text-black text-sm rounded"
            />
          </div>

          <div>
            <label className="block mb-0.5 text-xs">افغانی:</label>
            <input
              type="number"
              value={newDebt.afn}
              onChange={(e) =>
                setNewDebt({ ...newDebt, afn: parseFloat(e.target.value) || 0 })
              }
              className="w-full p-0.5 text-black text-sm rounded"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block mb-0.5 text-xs">یادداشت:</label>
            <input
              type="text"
              value={newDebt.notes}
              onChange={(e) =>
                setNewDebt({ ...newDebt, notes: e.target.value })
              }
              className="w-full p-0.5 text-black text-sm rounded"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <button
              onClick={handleCreate}
              className="bg-yellow-500 text-black p-1 rounded w-full text-sm"
            >
              ثبت بدهی
            </button>
          </div>
        </div>

        {/* جدول بدهی‌ها */}
        <div className="overflow-x-auto">
          <table className="w-full border border-yellow-500 text-xs">
            <thead className="bg-yellow-600 text-black">
              <tr>
                <th className="px-1 py-0.5">کد</th>
                <th className="px-1 py-0.5">مشتری</th>
                <th className="px-1 py-0.5">کارمند</th>
                <th className="px-1 py-0.5">گرام</th>
                <th className="px-1 py-0.5">توله</th>
                <th className="px-1 py-0.5">دالر</th>
                <th className="px-1 py-0.5">افغانی</th>
                <th className="px-1 py-0.5">یادداشت</th>
                <th className="px-1 py-0.5">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {debts.map((d) => {
                const customerName =
                  customers.find((c) => c.customer_id === d.customer_id)?.full_name || "ناشناخته";
                const employeeName =
                  employees.find((e) => e.employee_id === d.employee_id)?.full_name || "ناشناخته";

                return (
                  <tr key={d.debt_id} className="border-t border-yellow-500">
                    <td className="px-1 py-0.5">{d.debt_id}</td>
                    <td className="px-1 py-0.5">{customerName}</td>
                    <td className="px-1 py-0.5">{employeeName}</td>
                    <td className="px-1 py-0.5">{d.gold_grams}</td>
                    <td className="px-1 py-0.5">{d.tola}</td>
                    <td className="px-1 py-0.5">{d.usd}</td>
                    <td className="px-1 py-0.5">{d.afn}</td>
                    <td className="px-1 py-0.5">{d.notes || "-"}</td>
                    <td className="px-1 py-0.5">
                      <button
                        onClick={() => handleDelete(d.debt_id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })}
              {debts.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-1 text-center text-gray-400">
                    بدهی‌ای ثبت نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
