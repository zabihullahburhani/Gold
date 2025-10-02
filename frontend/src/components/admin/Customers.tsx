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

interface Transaction {
  txn_id: number;
  customer_id: number;
  gold_type_id: number;
  type: "buy" | "sell";
  dollar_balance: number;
  dollar_in: number;
  dollar_out: number;
  gold_balance: number;
  gold_in: number;
  gold_out: number;
  detail?: string;
  date: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    phone: "",
    address: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editMode, setEditMode] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // بارگذاری لیست مشتریان
  const loadCustomers = async () => {
    if (!token) return;
    try {
      const data = await apiFetchCustomers(token, searchQuery);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load customers:", error);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);

  // ثبت مشتری جدید
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

  // حذف مشتری
  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await apiDeleteCustomer(id, token);
      setSelectedCustomer(null);
      loadCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };


 // انتخاب مشتری و بارگذاری فقط تراکنش‌های همان مشتری
const handleSelectCustomer = async (customer: Customer) => {
  setSelectedCustomer(customer);
  setEditMode(false);
  setTransactions([]); // اول خالی شود

  if (!token) return;
  try {
    const res = await fetch(
      `http://localhost:8000/api/v1/transactions?customer_id=${customer.customer_id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) {
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } else {
      setTransactions([]); // اگر مشتری تراکنش ندارد → لیست خالی
    }
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    setTransactions([]); // در صورت خطا → خالی
  }
};


  // ویرایش مشتری
  const handleUpdate = async () => {
    if (!token || !selectedCustomer) return;
    try {
      await apiUpdateCustomer(selectedCustomer.customer_id, selectedCustomer, token);
      setEditMode(false);
      loadCustomers();
    } catch (error) {
      console.error("Failed to update customer:", error);
    }
  };

  return (
    <Card className="text-yellow-400 bg-black border-yellow-400">
      <CardHeader>مدیریت مشتریان</CardHeader>
      <CardContent>
        {/* جستجو */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="جستجو بر اساس نام، شماره یا آدرس..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 text-black w-full rounded-md"
          />
        </div>

        {/* فرم افزودن مشتری */}
        <div className="space-y-2 mb-4">
          <input
            type="text"
            placeholder="نام کامل"
            value={newCustomer.full_name}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, full_name: e.target.value })
            }
            className="border p-1 text-black w-full"
          />
          <input
            type="text"
            placeholder="شماره تماس"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
            className="border p-1 text-black w-full"
          />
          <input
            type="text"
            placeholder=" آدرس کامل"
            value={newCustomer.address}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, address: e.target.value })
            }
            className="border p-1 text-black w-full"
          />
          <button
            onClick={handleCreate}
            className="bg-yellow-500 p-2 rounded text-black w-full"
          >
            ثبت مشتری
          </button>
        </div>

        {/* جدول مشتریان */}
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
                <tr
                  key={c.customer_id}
                  className="border-b border-yellow-400 cursor-pointer hover:bg-gray-800"
                  onClick={() => handleSelectCustomer(c)}
                >
                  <td className="p-2">{c.customer_id}</td>
                  <td className="p-2">{c.full_name}</td>
                  <td className="p-2">{c.phone}</td>
                  <td className="p-2">{c.address}</td>
                  <td className="p-2">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.customer_id);
                      }}
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

        {/* جزئیات مشتری انتخاب‌شده */}
        {selectedCustomer && (
          <div className="mt-6 bg-gray-900 text-yellow-400 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2">
              جزئیات مشتری: {selectedCustomer.full_name}
            </h3>

            {editMode ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={selectedCustomer.full_name}
                  onChange={(e) =>
                    setSelectedCustomer({
                      ...selectedCustomer,
                      full_name: e.target.value,
                    })
                  }
                  className="border p-1 text-black w-full"
                />
                <input
                  type="text"
                  value={selectedCustomer.phone}
                  onChange={(e) =>
                    setSelectedCustomer({
                      ...selectedCustomer,
                      phone: e.target.value,
                    })
                  }
                  className="border p-1 text-black w-full"
                />
                <input
                  type="text"
                  value={selectedCustomer.address}
                  onChange={(e) =>
                    setSelectedCustomer({
                      ...selectedCustomer,
                      address: e.target.value,
                    })
                  }
                  className="border p-1 text-black w-full"
                />
                <button
                  onClick={handleUpdate}
                  className="bg-green-500 p-2 rounded text-black"
                >
                  ذخیره تغییرات
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-500 p-2 rounded text-black ml-2"
                >
                  انصراف
                </button>
              </div>
            ) : (
              <>
                <p>شماره: {selectedCustomer.phone}</p>
                <p>آدرس: {selectedCustomer.address}</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-500 p-2 mt-2 rounded text-black"
                >
                  ویرایش مشتری
                </button>
              </>
            )}

            {/* جدول تراکنش‌های مشتری */}
            <h4 className="mt-4 text-md font-semibold">تراکنش‌ها:</h4>
            {transactions.length > 0 ? (
              <table className="w-full mt-2 border-collapse">
                <thead>
                  <tr className="border-b border-yellow-400">
                    <th className="p-2">تاریخ</th>
                    <th className="p-2">نوع</th>
                    <th className="p-2">جمع دالر</th>
                    <th className="p-2">باقی دالر</th>
                    <th className="p-2">جمع طلا</th>
                    <th className="p-2">باقی طلا</th>
                    <th className="p-2">بیلانس دالر</th>
                    <th className="p-2">بیلانس طلا</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.txn_id} className="border-b border-gray-700">
                      <td className="p-2">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="p-2">{t.type}</td>
                      <td className="p-2">{t.dollar_in}</td>
                      <td className="p-2">{t.dollar_out}</td>
                      <td className="p-2">{t.gold_in}</td>
                      <td className="p-2">{t.gold_out}</td>
                      <td className="p-2">{t.dollar_balance}</td>
                      <td className="p-2">{t.gold_balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>هیچ تراکنشی یافت نشد.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
