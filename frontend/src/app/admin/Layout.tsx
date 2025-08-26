// src/app/admin/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Users, Package, FileText, BarChart, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white shadow-md transition-all ${open ? "w-64" : "w-16"} flex flex-col`}>
        <button
          onClick={() => setOpen(!open)}
          className="p-4 hover:bg-gray-200"
        >
          <Menu />
        </button>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <Link href="/admin/customers" className="flex items-center gap-2 p-3 hover:bg-gray-200">
                <Users /> {open && "مشتریان"}
              </Link>
            </li>
            <li>
              <Link href="/admin/employees" className="flex items-center gap-2 p-3 hover:bg-gray-200">
                <Package /> {open && "کارمندان"}
              </Link>
            </li>
            <li>
              <Link href="/admin/products" className="flex items-center gap-2 p-3 hover:bg-gray-200">
                <FileText /> {open && "محصولات"}
              </Link>
            </li>
            <li>
              <Link href="/admin/reports" className="flex items-center gap-2 p-3 hover:bg-gray-200">
                <BarChart /> {open && "گزارشات"}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4">
          <button className="flex items-center gap-2 p-2 w-full bg-red-100 hover:bg-red-200 rounded">
            <LogOut /> {open && "خروج"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center bg-white shadow p-4">
          <h1 className="font-bold text-xl">پنل مدیریت</h1>
          <input
            type="text"
            placeholder="جستجو..."
            className="border rounded px-3 py-1 w-64"
          />
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
