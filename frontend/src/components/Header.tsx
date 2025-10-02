"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { searchCustomers } from "../services/customers_api";

export default function Header() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleSearch = async () => {
    if (!query || !token) return;
    try {
      const data = await searchCustomers(query, token);
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCustomer = (id: number) => {
    setResults([]);
    setQuery("");
    router.push(`/customers/${id}`); // 👈 انتقال به صفحه پروفایل
  };

  return (
    <header className="header flex flex-col md:flex-row items-center justify-between p-4 bg-gray-900 text-gold-400 shadow-md relative">
      {/* لوگو */}
      <div className="flex items-center gap-3 mb-3 md:mb-0">
        <Image
          src="/icons/icon1.png"
          alt="لوگو دوکان"
          width={50}
          height={50}
          className="rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-sm">شرکت سازنده: BrainBridge Co.</span>
        </div>
      </div>

      {/* سرچ باکس */}
      <div className="flex w-full md:w-auto gap-2 mb-3 md:mb-0 relative">
        <input
          type="text"
          placeholder="جستجو مشتری..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3 py-2 rounded-l bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gold-400"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gold-400 text-darkbg font-bold rounded-r hover:bg-yellow-500 transition-colors"
        >
          جستجو
        </button>

        {/* نتایج */}
        {results.length > 0 && (
          <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded w-64 max-h-64 overflow-y-auto z-50">
            {results.map((c) => (
              <div
                key={c.customer_id}
                className="p-2 hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSelectCustomer(c.customer_id)}
              >
                {c.full_name} {c.phone ? `- ${c.phone}` : ""}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
