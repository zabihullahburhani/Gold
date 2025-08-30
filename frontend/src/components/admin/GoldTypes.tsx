"use client";
import React, { useEffect, useState } from "react";
import {
  fetchGoldTypes as apiFetchGoldTypes,
  createGoldType as apiCreateGoldType,
  updateGoldType as apiUpdateGoldType,
  deleteGoldType as apiDeleteGoldType,
} from "../../services/gold_types_api";
import { Card, CardHeader, CardContent } from "./ui/card";

interface GoldType {
  gold_type_id: number;
  type_name: string;
  description: string;
  created_at: string;
}

export default function GoldTypes() {
  const [goldTypes, setGoldTypes] = useState<GoldType[]>([]);
  const [newType, setNewType] = useState({ type_name: "", description: "" });

  const loadData = async () => {
    const data = await apiFetchGoldTypes();
    setGoldTypes(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    await apiCreateGoldType(newType);
    setNewType({ type_name: "", description: "" });
    loadData();
  };

  const handleDelete = async (id: number) => {
    await apiDeleteGoldType(id);
    loadData();
  };

  return (
    <Card>
      <CardHeader>مدیریت نوعیت طلا</CardHeader>
      <CardContent>
        <div className="space-y-2">
          <input
            placeholder="نوعیت طلا"
            value={newType.type_name}
            onChange={(e) => setNewType({ ...newType, type_name: e.target.value })}
            className="border p-1 text-black"
          />
          <input
            placeholder="توضیحات"
            value={newType.description}
            onChange={(e) => setNewType({ ...newType, description: e.target.value })}
            className="border p-1 text-black"
          />
          <button onClick={handleCreate} className="bg-yellow-500 p-2 rounded text-black">
            ثبت نوعیت
          </button>
        </div>

        <table className="w-full mt-4 border text-yellow-400">
          <thead>
            <tr>
              <th>کد</th>
              <th>نوعیت</th>
              <th>توضیحات</th>
              <th>تاریخ</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {goldTypes.map((g) => (
              <tr key={g.gold_type_id}>
                <td>{g.gold_type_id}</td>
                <td>{g.type_name}</td>
                <td>{g.description}</td>
                <td>{new Date(g.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(g.gold_type_id)} className="text-red-500">
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
