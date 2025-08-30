"use client";
import React, { useState } from "react";
import { requestActivation, verifyActivation } from "../../services/app_activations_api";
import { Card, CardHeader, CardContent } from "./ui/card";

export default function AppActivations() {
  const [hardwareId, setHardwareId] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [status, setStatus] = useState("");

  const handleRequest = async () => {
    const response = await requestActivation();
    setHardwareId(response.hardware_id);
    setStatus("Hardware ID sent. منتظر کد فعال‌سازی باشید.");
  };

  const handleVerify = async () => {
    const ok = await verifyActivation(activationCode);
    setStatus(ok ? "فعال شد ✅" : "کد نادرست ❌");
  };

  return (
    <Card>
      <CardHeader>فعال‌سازی برنامه</CardHeader>
      <CardContent>
        <button onClick={handleRequest} className="bg-yellow-500 p-2 rounded">
          ارسال آی‌دی سخت‌افزاری
        </button>
        {hardwareId && <p>Hardware ID: {hardwareId}</p>}

        <input
          type="text"
          placeholder="کد فعالسازی"
          value={activationCode}
          onChange={(e) => setActivationCode(e.target.value)}
          className="border p-1 text-black mt-2"
        />
        <button onClick={handleVerify} className="bg-green-500 p-2 rounded ml-2">تایید</button>

        <p className="mt-2">{status}</p>
      </CardContent>
    </Card>
  );
}
