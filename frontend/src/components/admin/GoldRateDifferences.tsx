"use client";
import React, { useEffect, useState } from "react";
import {
  fetchGoldRates as apiFetchGoldRates,
  createGoldRate as apiCreateGoldRate,
  updateGoldRate as apiUpdateGoldRate,
  deleteGoldRate as apiDeleteGoldRate,
} from "../../services/goldrates_api";
import { Card, CardHeader, CardContent } from "./ui/card";

interface GoldRate {
  rate_id: number;
  rate_per_gram_usd: number;
  rate_per_gram_afn: number;
  created_at: string;
}

export default function GoldRates() {
  const [rates, setRates] = useState<GoldRate[]>([]);
  const [newRate, setNewRate] = useState({ rate_per_gram_usd: 0, rate_per_gram_afn: 0 });

  const loadData = async () => {
    const data = await apiFetchGoldRates();
    setRates(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    await apiCreateGoldRate(newRate);
    setNewRate({ rate_per_gram_usd: 0, rate_per_gram_afn: 0 });
    loadData();
  };

  const handleDelete = async (id: number) => {
    await apiDeleteGoldRate(id);
    loadData();
  };

  return (
    <Card>
      <CardHeader>مدیریت قیمت طلا</CardHeader>
      <CardContent>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="قیمت هر گرام (دالر)"
            value={newRate.rate_per_gram_usd}
            onChange={(e) => setNewRate({ ...newRate, rate_per_gram_usd: parseFloat(e.target.value) })}
            className="border p-1 text-black"
          />
          <input
            type="number"
            placeholder="قیمت هر گرام (افغانی)"
            value={newRate.rate_per_gram_afn}
            onChange={(e) => setNewRate({ ...newRate, rate_per_gram_afn: parseFloat(e.target.value) })}
            className="border p-1 text-black"
          />
          <button onClick={handleCreate} className="bg-yellow-500 p-2 rounded text-black">
            ثبت نرخ
          </button>
        </div>

        <table className="w-full mt-4 border text-yellow-400">
          <thead>
            <tr>
              <th>کد</th>
              <th>نرخ دالر</th>
              <th>نرخ افغانی</th>
              <th>تاریخ</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.rate_id}>
                <td>{r.rate_id}</td>
                <td>{r.rate_per_gram_usd}</td>
                <td>{r.rate_per_gram_afn}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(r.rate_id)} className="text-red-500">
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
