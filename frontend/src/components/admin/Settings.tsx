"use client";
import React, { useState } from "react";
import { saveSettings } from "../../services/settings_api";
import { Card, CardHeader, CardContent } from "./ui/card";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = async () => {
    await saveSettings({ darkMode });
    alert("تنظیمات ذخیره شد");
  };

  return (
    <Card>
      <CardHeader>تنظیمات عمومی</CardHeader>
      <CardContent>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
          <span>Dark Mode</span>
        </label>
        <button onClick={handleSave} className="bg-yellow-500 p-2 rounded mt-2">ذخیره</button>
      </CardContent>
    </Card>
  );
}
