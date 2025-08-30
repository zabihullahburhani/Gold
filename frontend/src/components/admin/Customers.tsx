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

  const loadCustomers = async () => {
    const data = await apiFetchCustomers();
    setCustomers(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreate = async () => {
    await apiCreateCustomer(newCustomer);
    setNewCustomer({ full_name: "", phone: "", address: "" });
    loadCustomers();
  };

  const handleDelete = async (id: number) => {
    await apiDeleteCustomer(id);
    loadCustomers();
  };

  return (
    <Card>
      <CardHeader>مدیریت مشتریان</CardHeader>
      <CardContent>
        {/* فرم افزودن */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="نام کامل"
            value={newCustomer.full_name}
            onChange={(e) => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
            className="border p-1 text-black"
          />
          <input
            type="text"
            placeholder="شماره تماس"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            className="border p-1 text-black"
          />
          <input
            type="text"
            placeholder="آدرس"
            value={newCustomer.address}
            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
            className="border p-1 text-black"
          />
          <button onClick={handleCreate} className="bg-yellow-500 p-2 rounded text-black">
            ثبت مشتری
          </button>
        </div>

        {/* جدول */}
        <table className="w-full mt-4 border text-yellow-400">
          <thead>
            <tr>
              <th>کد</th>
              <th>نام</th>
              <th>شماره</th>
              <th>آدرس</th>
              <th>تاریخ</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.customer_id}>
                <td>{c.customer_id}</td>
                <td>{c.full_name}</td>
                <td>{c.phone}</td>
                <td>{c.address}</td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleDelete(c.customer_id)}
                    className="text-red-500"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
