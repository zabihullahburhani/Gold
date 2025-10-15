"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {logout, fetchUserProfile, API_BASE } from "../services/api";
import { searchCustomers} from "../services/customers_api";

import Image from "next/image";
import Link from "next/link";

// 🎯 تایپ‌ها
interface CompanyInfo {
  logoUrl: string;
  companyName: string;
  managerName: string;
}

interface CustomerResult {
  customer_id: number;
  full_name: string;
  phone: string | null;
}

interface UserProfile {
  username: string;
  full_name: string;
  role: string;
  phone?: string | null;
  profile_pic?: string | null;
}

const STORAGE_KEY = "company_info_config";
const FALLBACK_LOGO = "https://placehold.co/48x48/gold/000?text=L";
const DEFAULT_AVATAR = "/default-avatar.png";

// 📦 فایل به Base64
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function Header() {
  const router = useRouter();

  // 🎯 وضعیت‌ها
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false); // برای منوی کشویی

  // 🎯 اطلاعات شرکت
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    logoUrl: FALLBACK_LOGO,
    companyName: "نام شرکت شما",
    managerName: "نام مسئول",
  });
  const [tempInfo, setTempInfo] = useState<CompanyInfo>(companyInfo);
  const [showModal, setShowModal] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ------------------------------------
  // 1️⃣ بارگذاری اطلاعات شرکت از LocalStorage
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

  // ------------------------------------
  // 2️⃣ بارگذاری پروفایل کاربر
  // ------------------------------------
  useEffect(() => {
    async function loadProfile() {
      const res = await fetchUserProfile();
      if (res.ok) setUser(res.data as UserProfile);
    }
    if (token) loadProfile();
  }, [token]);

  // ------------------------------------
  // 3️⃣ ذخیره اطلاعات شرکت
  // ------------------------------------
  const handleSaveInfo = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tempInfo));
      setCompanyInfo(tempInfo);
      setShowModal(false);
    }
  };

  // ------------------------------------
  // 4️⃣ آپلود لوگو
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
  // 5️⃣ جستجوی مشتری
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

  // ------------------------------------
  // 6️⃣ مدیریت لاگ‌اوت
  // ------------------------------------
  const handleLogout = async () => {
    const res = await logout();
    if (res.ok) {
      localStorage.removeItem("token");
      setUser(null);
      router.push("/login");
      alert("با موفقیت از سیستم خارج شدید.");
    } else {
      alert(res.data.detail || "خطا در خروج از سیستم");
    }
  };

  // ------------------------------------
  // ✅ رابط کاربری
  // ------------------------------------
  return (
    <header className="header flex flex-col md:flex-row items-center justify-between p-4 bg-gray-900 text-gold-400 shadow-xl relative z-40">
      {/* 🎯 لوگو و اطلاعات شرکت */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-3 mb-3 md:mb-0 p-2 rounded-lg transition-colors hover:bg-gray-800"
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

      {/* 🎯 جستجوی مشتری */}
      <div className="flex w-full md:w-auto gap-2 mb-3 md:mb-0 relative">
        <input
          type="text"
          placeholder="جستجو مشتری..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
                  <span className="text-xs text-gray-400 mr-2">- {c.phone}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🎯 پروفایل کاربر و منوی کشویی */}
      <div className="flex items-center gap-3 relative">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800"
            >
              <span className="text-gray-200 font-medium">
                خوش آمدید، {user.full_name || user.username}
              </span>
              <Image
                src={
                  user.profile_pic
                    ? `${API_BASE.replace("/api/v1", "")}/uploads/${user.profile_pic}`
                    : DEFAULT_AVATAR
                }
                alt="Profile"
                width={38}
                height={38}
                className="rounded-full border-2 border-yellow-400 shadow-md"
              />
            </button>
            {showDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded shadow-lg w-48 z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-white hover:bg-gray-700"
                >
                  پروفایل
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                >
                  خروج
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="text-yellow-500 hover:text-yellow-400 font-semibold"
          >
            ورود
          </Link>
        )}
      </div>

      {/* 🎯 Modal تنظیمات شرکت */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gold-400">
            <h2 className="text-xl font-bold mb-4 text-gold-400">
              ویرایش اطلاعات شرکت
            </h2>

            <div className="space-y-4">
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 text-sm font-semibold"
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
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white"
              >
                لغو
              </button>
              <button
                onClick={handleSaveInfo}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
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