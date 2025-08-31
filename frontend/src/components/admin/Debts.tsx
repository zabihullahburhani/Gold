// path: frontend/src/components/admin/Debts.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
    fetchDebts,
    createDebt,
    updateDebt,
    deleteDebt,
} from "../../services/debts_api";
import { Card, CardHeader, CardContent } from "./ui/card";

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

export default function Debts() {
    const [debts, setDebts] = useState<Debt[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
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
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const loadDebts = async () => {
        if (!token) return;
        try {
            const data = await fetchDebts(token, searchQuery);
            setDebts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load debts:", error);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            loadDebts();
        }, 500); // Debounce search
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const handleCreate = async () => {
        if (!token) return;
        try {
            await createDebt(newDebt, token);
            setNewDebt({ customer_id: 0, employee_id: 0, gold_grams: 0, tola: 0, usd: 0, afn: 0, notes: "", is_paid: false });
            loadDebts();
        } catch (error) {
            console.error("Failed to create debt:", error);
        }
    };

    const handleUpdateStatus = async (debtId: number, isPaid: boolean) => {
        if (!token) return;
        try {
            await updateDebt(debtId, { is_paid: is_paid }, token);
            loadDebts();
        } catch (error) {
            console.error("Failed to update debt status:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!token) return;
        try {
            await deleteDebt(id, token);
            loadDebts();
        } catch (error) {
            console.error("Failed to delete debt:", error);
        }
    };

    return (
        <Card className="text-yellow-400 bg-black border-yellow-400">
            <CardHeader>مدیریت بدهی‌ها</CardHeader>
            <CardContent>
                {/* کادر جستجو */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="جستجو بر اساس مقدار یا یادداشت..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border p-2 text-black w-full rounded-md"
                    />
                </div>

                {/* فرم افزودن */}
                <div className="space-y-2 mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input type="number" placeholder="کد مشتری" value={newDebt.customer_id} onChange={(e) => setNewDebt({ ...newDebt, customer_id: parseInt(e.target.value) || 0 })} className="border p-1 text-black w-full" />
                    <input type="number" placeholder="کد کارمند" value={newDebt.employee_id} onChange={(e) => setNewDebt({ ...newDebt, employee_id: parseInt(e.target.value) || 0 })} className="border p-1 text-black w-full" />
                    <input type="number" step="0.01" placeholder="مقدار بدهی (گرام)" value={newDebt.gold_grams} onChange={(e) => setNewDebt({ ...newDebt, gold_grams: parseFloat(e.target.value) || 0 })} className="border p-1 text-black w-full" />
                    <input type="number" step="0.01" placeholder="مقدار بدهی (توله)" value={newDebt.tola} onChange={(e) => setNewDebt({ ...newDebt, tola: parseFloat(e.target.value) || 0 })} className="border p-1 text-black w-full" />
                    <input type="number" step="0.01" placeholder="مقدار بدهی ($)" value={newDebt.usd} onChange={(e) => setNewDebt({ ...newDebt, usd: parseFloat(e.target.value) || 0 })} className="border p-1 text-black w-full" />
                    <input type="number" step="0.01" placeholder="مقدار بدهی (افغانی)" value={newDebt.afn} onChange={(e) => setNewDebt({ ...newDebt, afn: parseFloat(e.target.value) || 0 })} className="border p-1 text-black w-full" />
                    <input type="text" placeholder="یادداشت" value={newDebt.notes} onChange={(e) => setNewDebt({ ...newDebt, notes: e.target.value })} className="border p-1 text-black w-full" />
                    <button onClick={handleCreate} className="bg-yellow-500 p-2 rounded text-black w-full col-span-1 md:col-span-2 lg:col-span-3">
                        ثبت بدهی
                    </button>
                </div>
    
                {/* جدول بدهی‌ها */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-yellow-400">
                                <th className="p-2 text-left">کد بدهی</th>
                                <th className="p-2 text-left">کد مشتری</th>
                                <th className="p-2 text-left">کد کارمند</th>
                                <th className="p-2 text-left">گرام</th>
                                <th className="p-2 text-left">توله</th>
                                <th className="p-2 text-left">$</th>
                                <th className="p-2 text-left">افغانی</th>
                                <th className="p-2 text-left">یادداشت</th>
                                <th className="p-2 text-left">وضعیت</th>
                                <th className="p-2 text-left">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {debts.map((d) => (
                                <tr key={d.debt_id} className="border-b border-yellow-400">
                                    <td className="p-2">{d.debt_id}</td>
                                    <td className="p-2">{d.customer_id}</td>
                                    <td className="p-2">{d.employee_id}</td>
                                    <td className="p-2">{d.gold_grams}</td>
                                    <td className="p-2">{d.tola}</td>
                                    <td className="p-2">{d.usd}</td>
                                    <td className="p-2">{d.afn}</td>
                                    <td className="p-2">{d.notes}</td>
                                    <td className="p-2">
                                        <button onClick={() => handleUpdateStatus(d.debt_id, !d.is_paid)} className={`rounded px-2 py-1 text-sm ${d.is_paid ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                                            {d.is_paid ? "پرداخت شده" : "در حال پرداخت"}
                                        </button>
                                    </td>
                                    <td className="p-2">
                                        <button onClick={() => handleDelete(d.debt_id)} className="text-red-500 hover:text-red-700">
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}