// نویسنده: ذبیح الله برهانی
// آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.
// frontend/src/components/GoldTypes.tsx

"use client";
import React, { useEffect, useState } from "react";
import { fetchGoldTypes, createGoldType, updateGoldType, deleteGoldType } from "../../services/goldtypes_api";
import { Card, CardHeader, CardContent } from "./ui/card";

interface GoldType {
    gold_type_id: number;
    name: string;
    description?: string;
}

export default function GoldTypes() {
    const [goldTypes, setGoldTypes] = useState<GoldType[]>([]);
    const [newGoldType, setNewGoldType] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedGoldType, setEditedGoldType] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const loadGoldTypes = async () => {
        if (!token) return;
        try {
            const data = await fetchGoldTypes(token);
            setGoldTypes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load gold types:", error);
        }
    };

    useEffect(() => {
        loadGoldTypes();
    }, []);

    const handleCreate = async () => {
        if (!token || !newGoldType.name) {
            console.error("Authentication token is missing or gold type name is empty.");
            return;
        }
        setLoading(true);
        try {
            await createGoldType(newGoldType, token);
            setNewGoldType({ name: '', description: '' });
            loadGoldTypes();
        } catch (error) {
            console.error("Failed to create gold type:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id: number) => {
        if (!token || !editedGoldType.name) {
            console.error("Authentication token is missing or edited name is empty.");
            return;
        }
        setLoading(true);
        try {
            await updateGoldType(id, editedGoldType, token);
            setEditingId(null);
            setEditedGoldType({ name: '', description: '' });
            loadGoldTypes();
        } catch (error) {
            console.error("Failed to update gold type:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!token) {
            console.error("Authentication token is missing.");
            return;
        }
        setLoading(true);
        try {
            await deleteGoldType(id, token);
            loadGoldTypes();
        } catch (error) {
            console.error("Failed to delete gold type:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="text-yellow-400 bg-black border-yellow-400">
            <CardHeader>مدیریت انواع طلا</CardHeader>
            <CardContent>
                {/* فرم افزودن */}
                <div className="space-y-2 mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="نام نوع طلا"
                        value={newGoldType.name}
                        onChange={(e) => setNewGoldType({ ...newGoldType, name: e.target.value })}
                        className="border p-1 text-black w-full rounded-md"
                    />
                    <input
                        type="text"
                        placeholder="توضیحات"
                        value={newGoldType.description}
                        onChange={(e) => setNewGoldType({ ...newGoldType, description: e.target.value })}
                        className="border p-1 text-black w-full rounded-md"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="bg-yellow-500 p-2 rounded text-black w-full flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? "..." : "ثبت"}
                    </button>
                </div>

                {/* جدول انواع طلا */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-yellow-400">
                                <th className="p-2 text-left">کد</th>
                                <th className="p-2 text-left">نام</th>
                                <th className="p-2 text-left">توضیحات</th>
                                <th className="p-2 text-left">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {goldTypes.map((gt) => (
                                <tr key={gt.gold_type_id} className="border-b border-yellow-400">
                                    <td className="p-2">{gt.gold_type_id}</td>
                                    <td className="p-2">
                                        {editingId === gt.gold_type_id ? (
                                            <input
                                                type="text"
                                                value={editedGoldType.name}
                                                onChange={(e) => setEditedGoldType({ ...editedGoldType, name: e.target.value })}
                                                className="border p-1 text-black w-full rounded-md"
                                            />
                                        ) : (
                                            gt.name
                                        )}
                                    </td>
                                    <td className="p-2">
                                        {editingId === gt.gold_type_id ? (
                                            <input
                                                type="text"
                                                value={editedGoldType.description}
                                                onChange={(e) => setEditedGoldType({ ...editedGoldType, description: e.target.value })}
                                                className="border p-1 text-black w-full rounded-md"
                                            />
                                        ) : (
                                            gt.description
                                        )}
                                    </td>
                                    <td className="p-2 space-x-2 flex items-center">
                                        {editingId === gt.gold_type_id ? (
                                            <button
                                                onClick={() => handleUpdate(gt.gold_type_id)}
                                                className="text-green-500 hover:text-green-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                                                disabled={loading}
                                            >
                                                ذخیره
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingId(gt.gold_type_id);
                                                    setEditedGoldType({ name: gt.name, description: gt.description || '' });
                                                }}
                                                className="text-yellow-500 hover:text-yellow-700"
                                            >
                                                ویرایش
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(gt.gold_type_id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
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
