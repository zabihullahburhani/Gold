"use client";
import React, { useState } from "react";
import { saveDBSettings } from "../../services/database_settings_api";
import { Card, CardHeader, CardContent } from "./ui/card";

export default function DatabaseSettings() {
  const [settings, setSettings] = useState({ host: "", port: "", db: "", user: "", password: "" });

  const handleSave = async () => {
    await saveDBSettings(settings);
    alert("تنظیمات دیتابیس ذخیره شد.");
  };

  return (
    <Card>
      <CardHeader>تنظیمات دیتابیس</CardHeader>
      <CardContent>
        {Object.keys(settings).map((k) => (
          <input
            key={k}
            placeholder={k}
            value={(settings as any)[k]}
            onChange={(e) => setSettings({ ...settings, [k]: e.target.value })}
            className="border p-1 text-black block my-1"
          />
        ))}
        <button onClick={handleSave} className="bg-yellow-500 p-2 rounded">ذخیره</button>
      </CardContent>
    </Card>
  );
}
