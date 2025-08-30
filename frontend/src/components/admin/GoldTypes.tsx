"use client";
import React, { useEffect, useState } from "react";
import {
  fetchGoldTypes as apiFetchGoldTypes,
  createGoldType as apiCreateGoldType,
  updateGoldType as apiUpdateGoldType,
  deleteGoldType as apiDeleteGoldType,
  GoldType,
} from "../../services/goldtypes_api";

import { Card, CardHeader, CardContent } from "./ui/card";

const GoldTypes: React.FC = () => {
  const [goldTypes, setGoldTypes] = useState<GoldType[]>([]);
  const [form, setForm] = useState<GoldType>({ name: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await apiFetchGoldTypes();
      setGoldTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiUpdateGoldType(editingId, form);
        setEditingId(null);
      } else {
        await apiCreateGoldType(form);
      }
      setForm({ name: "", description: "" });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (g: GoldType) => {
    setForm(g);
    setEditingId(g.gold_type_id || null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا مطمئن هستید؟")) return;
    try {
      await apiDeleteGoldType(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="p-4">
      <CardHeader>
        <h2 className="text-xl font-bold">مدیریت انواع طلا</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-2 mb-4">
          <input
            type="text"
            placeholder="نام نوع طلا"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 w-full"
            required
          />
          <input
            type="text"
            placeholder="توضیحات"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2 w-full"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editingId ? "ویرایش نوع طلا" : "افزودن نوع طلا"}
          </button>
        </form>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>ID</th>
              <th>نام</th>
              <th>توضیحات</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {goldTypes.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-2">
                  هیچ نوع طلا ثبت نشده است
                </td>
              </tr>
            ) : (
              goldTypes.map((g) => (
                <tr key={g.gold_type_id}>
                  <td>{g.gold_type_id}</td>
                  <td>{g.name}</td>
                  <td>{g.description}</td>
                  <td>
                    <button onClick={() => handleEdit(g)} className="text-blue-500">
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(g.gold_type_id!)}
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

export default GoldTypes;
