// path: frontend/src/components/admin/Customers.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  fetchCustomers as apiFetchCustomers,
  createCustomer as apiCreateCustomer,
  updateCustomer as apiUpdateCustomer,
  deleteCustomer as apiDeleteCustomer,
} from "../../services/customers_api";
import { Card, CardHeader, CardContent } from "./ui/card";

interface Customer {
  customer_id: number;
  full_name: string;
  phone: string;
  address: string;
  created_at: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    phone: "",
    address: "",
  });
  // search in customer table
  const [searchQuery, setSearchQuery]= useState(' ');

  // توکن را از localStorage می‌خوانیم
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const loadCustomers = async () => {
    if (!token) return;
    try {
      const data = await apiFetchCustomers(token, searchQuery); // search added
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load customers:", error);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);  // search added

  const handleCreate = async () => {
    if (!token) return;
    try {
      await apiCreateCustomer(newCustomer, token);
      setNewCustomer({ full_name: "", phone: "", address: "" });
      loadCustomers();
    } catch (error) {
      console.error("Failed to create customer:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await apiDeleteCustomer(id, token);
      loadCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  return (
    <Card className="text-yellow-400 bg-black border-yellow-400">
      <CardHeader>مدیریت مشتریان</CardHeader>
      <CardContent>
           {/* فیلد ورودی جستجو */}
    <div className="mb-4">
      <input
        type="text"
        placeholder="جستجو بر اساس نام، شماره یا آدرس..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border p-2 text-black w-full rounded-md"
      />
   </div>

        {/* فرم افزودن */}
        <div className="space-y-2 mb-4">
          <input
            type="text"
            placeholder="نام کامل"
            value={newCustomer.full_name}
            onChange={(e) => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
            className="border p-1 text-black w-full"
          />
          <input
            type="text"
            placeholder="شماره تماس"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            className="border p-1 text-black w-full"
          />
          <input
            type="text"
            placeholder="آدرس"
            value={newCustomer.address}
            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
            className="border p-1 text-black w-full"
          />
          <button onClick={handleCreate} className="bg-yellow-500 p-2 rounded text-black w-full">
            ثبت مشتری
          </button>
        </div>

        {/* جدول */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-yellow-400">
                <th className="p-2 text-left">کد</th>
                <th className="p-2 text-left">نام</th>
                <th className="p-2 text-left">شماره</th>
                <th className="p-2 text-left">آدرس</th>
                <th className="p-2 text-left">تاریخ</th>
                <th className="p-2 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.customer_id} className="border-b border-yellow-400">
                  <td className="p-2">{c.customer_id}</td>
                  <td className="p-2">{c.full_name}</td>
                  <td className="p-2">{c.phone}</td>
                  <td className="p-2">{c.address}</td>
                  <td className="p-2">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(c.customer_id)}
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