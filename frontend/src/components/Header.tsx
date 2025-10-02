"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { searchCustomers } from "../services/customers_api";

// 🎯 تعریف تایپ برای اطلاعات شرکت
interface CompanyInfo {
  logoUrl: string; // Base64 String یا URL
  companyName: string;
  managerName: string;
}

// 🎯 تعریف تایپ برای نتایج جستجو
interface CustomerResult {
  customer_id: number;
  full_name: string;
  phone: string | null;
}

const STORAGE_KEY = "company_info_config";
const FALLBACK_LOGO = "https://placehold.co/48x48/gold/000?text=L";

// ------------------------------------
// تابع کمکی برای خواندن فایل به صورت Base64
// ------------------------------------
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // 🎯 State برای اطلاعات فعلی شرکت
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    logoUrl: FALLBACK_LOGO,
    companyName: "نام شرکت شما" ,
    managerName: "نام مسئول",
  });

  const [tempInfo, setTempInfo] = useState<CompanyInfo>(companyInfo);
  const [showModal, setShowModal] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ------------------------------------
  // 1. بارگذاری اطلاعات از LocalStorage
  // ------------------------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedInfo = localStorage.getItem(STORAGE_KEY);
      if (savedInfo) {
        const parsedInfo = JSON.parse(savedInfo);
        setCompanyInfo(parsedInfo);
        setTempInfo(parsedInfo);
      }
    }
  }, []);

  const handleSaveInfo = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tempInfo));
      setCompanyInfo(tempInfo);
      setShowModal(false);
    }
  };

  // ------------------------------------
  // 2. بارگذاری فایل لوگو
  // ------------------------------------
  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64String = await fileToBase64(file);
        setTempInfo({ ...tempInfo, logoUrl: base64String });
        event.target.value = "";
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  };

  // ------------------------------------
  // 3. سرچ واقعی مشتری‌ها
  // ------------------------------------
  const handleSearch = async () => {
    if (!query || !token) return;
    setLoadingSearch(true);
    setResults([]);

    try {
      const data: CustomerResult[] = await searchCustomers(query, token);
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSelectCustomer = (id: number) => {
    setResults([]);
    setQuery("");
    router.push(`/customers/${id}`);
  };

  return (
    <header className="header flex flex-col md:flex-row items-center justify-between p-4 bg-gray-900 text-gold-400 shadow-xl relative z-40">
      {/* 🎯 لوگو و اطلاعات شرکت */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-3 mb-3 md:mb-0 p-2 rounded-lg transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gold-400"
      >
        <div className="w-12 h-12 relative flex-shrink-0">
          <img
            src={companyInfo.logoUrl}
            alt="لوگو شرکت"
            className="w-full h-full rounded-full border border-gold-400 object-cover"
            onError={(e) => (e.currentTarget.src = FALLBACK_LOGO)}
          />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-lg font-bold text-yellow-500">
            {companyInfo.companyName}
          </span>
          <span className="text-sm text-gray-400">
            مسئول: {companyInfo.managerName}
          </span>
        </div>
      </button>

      {/* 🎯 سرچ مشتری */}
      <div className="flex w-full md:w-auto gap-2 mb-3 md:mb-0 relative">
        <input
          type="text"
          placeholder="جستجو مشتری..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="flex-1 px-3 py-2 rounded-l bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
        />
        <button
          onClick={handleSearch}
          disabled={loadingSearch || !query}
          className={`px-4 py-2 text-gray-900 font-bold rounded-r transition-colors ${
            loadingSearch || !query
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gold-400 hover:bg-yellow-500"
          }`}
        >
          {loadingSearch ? "درحال جستجو..." : "جستجو"}
        </button>

        {/* نتایج */}
        {results.length > 0 && (
          <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded w-full max-h-64 overflow-y-auto z-50 shadow-lg">
            {results.map((c) => (
              <div
                key={c.customer_id}
                className="p-2 hover:bg-gray-700 cursor-pointer text-white border-b border-gray-700 last:border-b-0"
                onClick={() => handleSelectCustomer(c.customer_id)}
              >
                <span className="font-semibold">{c.full_name}</span>
                {c.phone && (
                  <span className="text-xs text-gray-400 mr-2">
                    - {c.phone}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🎯 Modal ویرایش اطلاعات شرکت */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gold-400">
            <h2 className="text-xl font-bold mb-4 text-gold-400">
              ویرایش اطلاعات شرکت
            </h2>

            <div className="space-y-4">
              {/* بارگذاری لوگو */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  بارگذاری لوگو (PNG, JPG)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    انتخاب فایل
                  </label>
                  <span className="text-gray-400 text-sm truncate">
                    {tempInfo.logoUrl.startsWith("data:image/")
                      ? "فایل لوگو بارگذاری شد"
                      : "لوگوی پیش‌فرض یا URL"}
                  </span>
                </div>
              </div>

              {/* نام شرکت */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  نام شرکت
                </label>
                <input
                  type="text"
                  value={tempInfo.companyName}
                  onChange={(e) =>
                    setTempInfo({ ...tempInfo, companyName: e.target.value })
                  }
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                />
              </div>

              {/* نام مسئول */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  نام مسئول
                </label>
                <input
                  type="text"
                  value={tempInfo.managerName}
                  onChange={(e) =>
                    setTempInfo({ ...tempInfo, managerName: e.target.value })
                  }
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors"
              >
                لغو
              </button>
              <button
                onClick={handleSaveInfo}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors"
              >
                ذخیره و اعمال
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
