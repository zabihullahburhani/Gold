"use client";
import React, { useEffect, useState } from "react";
import {
  fetchAssets,
  createAsset,
  deleteAsset
} from "../../services/shop_assets_api";
import { Card, CardHeader, CardContent } from "./ui/card";

interface Asset {
  asset_id: number;
  name: string;
  value: number;
}

export default function ShopAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [newAsset, setNewAsset] = useState({ name: "", value: 0 });

  useEffect(() => {
    fetchAssets().then((d) => setAssets(Array.isArray(d) ? d : []));
  }, []);

  const handleAdd = async () => {
    await createAsset(newAsset);
    setNewAsset({ name: "", value: 0 });
    fetchAssets().then((d) => setAssets(d));
  };

  return (
    <Card>
      <CardHeader>دارایی‌های دکان</CardHeader>
      <CardContent>
        <input
          type="text"
          placeholder="نام دارایی"
          value={newAsset.name}
          onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
          className="border p-1 text-black"
        />
        <input
          type="number"
          placeholder="ارزش"
          value={newAsset.value}
          onChange={(e) => setNewAsset({ ...newAsset, value: parseFloat(e.target.value) })}
          className="border p-1 text-black"
        />
        <button onClick={handleAdd} className="bg-yellow-500 px-2 rounded">افزودن</button>

        <ul className="mt-4">
          {assets.map((a) => (
            <li key={a.asset_id}>{a.name} - {a.value}$</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
