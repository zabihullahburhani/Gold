"use client";

import { useState } from "react";

export default function AppActivation() {
  const [licenseKey, setLicenseKey] = useState("");
  const [activated, setActivated] = useState(false);

  const handleActivate = () => {
    if (licenseKey.trim() === "") return;
    // TODO: درخواست به API
    setActivated(true);
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-md p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gold mb-4">فعال‌سازی برنامه</h2>

      {!activated ? (
        <>
          <p className="text-gray-300 mb-3">
            لطفاً کد لایسنس خود را برای فعال‌سازی وارد کنید:
          </p>
          <input
            type="text"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="کد لایسنس"
          />
          <button
            onClick={handleActivate}
            className="mt-4 w-full bg-gold text-black font-semibold py-2 rounded-lg shadow hover:bg-yellow-500 transition"
          >
            فعال‌سازی
          </button>
        </>
      ) : (
        <p className="text-green-400 font-bold">
          ✅ برنامه با موفقیت فعال شد!
        </p>
      )}
    </div>
  );
}
