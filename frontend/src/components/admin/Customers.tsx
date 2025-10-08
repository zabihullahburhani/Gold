"use client";
import { Download } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import {
  fetchCustomers as apiFetchCustomers,
  createCustomer as apiCreateCustomer,
  updateCustomer as apiUpdateCustomer,
  deleteCustomer as apiDeleteCustomer,
} from "../../services/customers_api";
import { Card, CardHeader, CardContent } from "./ui/card";
import * as XLSX from 'xlsx';
import moment from 'moment-jalaali';

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
  type: "buy" | "sell";
  dollar_balance: number;
  dollar_in: number;
  dollar_out: number;
  gold_balance: number;
  gold_in: number;
  gold_out: number;
  detail?: string;
  date: string;
  source_carat?: number;
  weight?: number;
  gold_rate?: number;
  gold_amount?: number;
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

  // محاسبات جدید
  const totals = useMemo(() => {
    let totalDollarReceived = 0;
    let totalDollarPaid = 0;
    let totalGoldReceived = 0;
    let totalGoldPaid = 0;
    let buyCount = 0;
    let sellCount = 0;

    transactions.forEach(t => {
      totalDollarReceived += t.dollar_in;
      totalDollarPaid += t.dollar_out;
      totalGoldReceived += t.gold_in;
      totalGoldPaid += t.gold_out;
      if (t.type === "buy") buyCount++;
      if (t.type === "sell") sellCount++;
    });

    const dollarBalance = totalDollarReceived - totalDollarPaid;
    const goldBalance = totalGoldReceived - totalGoldPaid;
    const dollarLabel = dollarBalance >= 0 ? "اضافی" : "باقی";
    const goldLabel = goldBalance >= 0 ? "اضافی" : "باقی";

    return {
      totalDollarReceived,
      totalDollarPaid,
      dollarBalance,
      dollarLabel,
      totalGoldReceived,
      totalGoldPaid,
      goldBalance,
      goldLabel,
      buyCount,
      sellCount,
    };
  }, [transactions]);

  const handleDownloadReport = () => {
  if (!selectedCustomer) return;

  // ✅ داده‌های تراکنش بدون ستون بیلانس
  const data = transactions.map(t => ({
    'تاریخ': new Date(t.date).toLocaleDateString('fa-IR'),
    'نوع': t.type === "buy" ? "خرید" : "فروش",
    'دالر ورودی': t.dollar_in.toFixed(3),
    'دالر خروجی': t.dollar_out.toFixed(3),
    'طلا ورودی': t.gold_in.toFixed(3),
    'طلا خروجی': t.gold_out.toFixed(3),
    'توضیحات': t.detail || "",
    'وزن': t.weight?.toFixed(3) || "",
    'عیار مبدا': t.source_carat?.toFixed(3) || "",
    'نرخ طلا': t.gold_rate?.toFixed(3) || "",
    'مقدار طلا': t.gold_amount?.toFixed(3) || "",
  }));

  // ✅ محاسبه مجموع‌ها و امتیاز
  const totalsRow = [
    "مجموع",
    "",
    totals.totalDollarReceived.toFixed(3),
    totals.totalDollarPaid.toFixed(3),
    totals.totalGoldReceived.toFixed(3),
    totals.totalGoldPaid.toFixed(3),
    "",
    "",
    "",
    "",
    "",
    ((totals.buyCount + totals.sellCount) * 10 +
       totals.totalDollarReceived / 10000 +
       totals.totalGoldReceived / 10).toFixed(2)
  ];

  // ✅ ساخت ورق اکسل
  const worksheet = XLSX.utils.json_to_sheet([]); 

  // بخش اول: معلومات مشتری
  XLSX.utils.sheet_add_aoa(worksheet, [
    ['معلومات مشتری'],
    [`نام مشتری: ${selectedCustomer.full_name}`],
    [`شماره تماس: ${selectedCustomer.phone}`],
    [`آدرس: ${selectedCustomer.address}`],
    [`تاریخ گزارش: ${moment().format('jYYYY/jMM/jDD')}`],
    [], // خط فاصله
  ]);

  // بخش دوم: جدول تراکنش‌ها
  XLSX.utils.sheet_add_json(worksheet, data, { origin: -1, skipHeader: false });

  // بخش سوم: خط فاصله
  XLSX.utils.sheet_add_aoa(worksheet, [[]], { origin: -1 });

  // بخش چهارم: مجموع‌ها و امتیاز در یک سطر منظم
  XLSX.utils.sheet_add_aoa(worksheet, [
    [
      "تعداد خریدها", "تعداد فروش‌ها",
      "مجموع دالر ورودی", "مجموع دالر خروجی",
      "مجموع طلا ورودی", "مجموع طلا خروجی",
      "توضیحات", "وزن", "عیار مبدا", "نرخ طلا", "مقدار طلا",
      "امتیاز مشتری"
    ],
    [
      totals.buyCount,
      totals.sellCount,
      totals.totalDollarReceived.toFixed(3),
      totals.totalDollarPaid.toFixed(3),
      totals.totalGoldReceived.toFixed(3),
      totals.totalGoldPaid.toFixed(3),
      "", "", "", "", "",
      ((totals.buyCount + totals.sellCount) * 10 +
       totals.totalDollarReceived / 10000 +
       totals.totalGoldReceived / 10).toFixed(2)
    ]
  ], { origin: -1 });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "گزارش معاملات مشتری");

  const date = moment().format('jYYYY-jMM-jDD');
  XLSX.writeFile(workbook, `گزارش_${selectedCustomer.full_name}_${date}.xlsx`);
};



  return (
    <Card className="text-black bg-white border-gray-300">
      <CardHeader>مدیریت مشتریان</CardHeader>
      <CardContent>
        {/* جستجو */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="جستجو بر اساس نام، شماره یا آدرس..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 text-black w-full rounded-md bg-gray-100"
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
            className="border p-1 text-black w-full bg-gray-100"
          />
          <input
            type="text"
            placeholder="شماره تماس"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
            className="border p-1 text-black w-full bg-gray-100"
          />
          <input
            type="text"
            placeholder=" آدرس کامل"
            value={newCustomer.address}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, address: e.target.value })
            }
            className="border p-1 text-black w-full bg-gray-100"
          />
          <button
            onClick={handleCreate}
            className="bg-teal-600 p-2 rounded text-white w-full hover:bg-teal-700"
          >
            ثبت مشتری
          </button>
        </div>

        {/* جدول مشتریان */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100">
                <th className="p-2 text-left text-gray-600">کد</th>
                <th className="p-2 text-left text-gray-600">نام</th>
                <th className="p-2 text-left text-gray-600">شماره</th>
                <th className="p-2 text-left text-gray-600">آدرس</th>
                <th className="p-2 text-left text-gray-600">تاریخ</th>
                <th className="p-2 text-left text-gray-600">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.customer_id}
                  className="border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSelectCustomer(c)}
                >
                  <td className="p-2 text-gray-800">{c.customer_id}</td>
                  <td className="p-2 text-gray-800">{c.full_name}</td>
                  <td className="p-2 text-gray-800">{c.phone}</td>
                  <td className="p-2 text-gray-800">{c.address}</td>
                  <td className="p-2 text-gray-800">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.customer_id);
                      }}
                      className="text-red-600 hover:text-red-800"
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
          <div className="mt-6 bg-white text-black p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold mb-2 text-teal-600">
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
                  className="border p-1 text-black w-full bg-gray-100"
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
                  className="border p-1 text-black w-full bg-gray-100"
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
                  className="border p-1 text-black w-full bg-gray-100"
                />
                <button
                  onClick={handleUpdate}
                  className="bg-teal-600 p-2 rounded text-white hover:bg-teal-700"
                >
                  ذخیره تغییرات
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-300 p-2 rounded text-black ml-2 hover:bg-gray-400"
                >
                  انصراف
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-800">شماره: {selectedCustomer.phone}</p>
                <p className="text-gray-800">آدرس: {selectedCustomer.address}</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-teal-600 p-2 mt-2 rounded text-white hover:bg-teal-700"
                >
                  ویرایش مشتری
                </button>
              </>
            )}

            {/* جدول تراکنش‌های مشتری */}
            <h4 className="mt-4 text-md font-semibold text-teal-600">تراکنش‌ها:</h4>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto mt-2">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-100">
                      <th className="p-2 text-left text-gray-600">تاریخ</th>
                      <th className="p-2 text-left text-gray-600">نوع</th>
                      <th className="p-2 text-left text-gray-600">وزن</th>
                      <th className="p-2 text-left text-gray-600">عیار مبدا</th>
                      <th className="p-2 text-left text-gray-600">نرخ طلا</th>
                      <th className="p-2 text-left text-gray-600">مقدار طلا</th>
                      <th className="p-2 text-left text-gray-600">دالر ورودی</th>
                      <th className="p-2 text-left text-gray-600">دالر خروجی</th>
                      <th className="p-2 text-left text-gray-600">طلا ورودی</th>
                      <th className="p-2 text-left text-gray-600">طلا خروجی</th>
                      <th className="p-2 text-left text-gray-600">بیلانس دالر</th>
                      <th className="p-2 text-left text-gray-600">بیلانس طلا</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.txn_id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-2 text-gray-800">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="p-2 text-gray-800">{t.type}</td>
                        <td className="p-2 text-gray-800">{t.weight ? t.weight.toFixed(3) : '-'}</td>
                        <td className="p-2 text-gray-800">{t.source_carat ? t.source_carat.toFixed(3) : '-'}</td>
                        <td className="p-2 text-gray-800">{t.gold_rate ? t.gold_rate.toFixed(3) : '-'}</td>
                        <td className="p-2 text-gray-800">{t.gold_amount ? t.gold_amount.toFixed(3) : '-'}</td>
                        <td className="p-2 text-gray-800">{t.dollar_in.toFixed(3)}</td>
                        <td className="p-2 text-gray-800">{t.dollar_out.toFixed(3)}</td>
                        <td className="p-2 text-gray-800">{t.gold_in.toFixed(3)}</td>
                        <td className="p-2 text-gray-800">{t.gold_out.toFixed(3)}</td>
                        <td className="p-2 text-gray-800">{t.dollar_balance.toFixed(3)}</td>
                        <td className="p-2 text-gray-800">{t.gold_balance.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                  <div className="mt-4 p-2 bg-gray-100 rounded-lg text-sm text-gray-800">
                  <p>مجموع دالر ورودی: {totals.totalDollarReceived.toFixed(3)}</p>
                  <p>مجموع دالر خروجی: {totals.totalDollarPaid.toFixed(3)}</p>
                  <p>بیلانس دالر: {totals.dollarBalance.toFixed(3)} ({totals.dollarLabel})</p>
                  <p>مجموع طلا ورودی: {totals.totalGoldReceived.toFixed(3)}</p>
                  <p>مجموع طلا خروجی: {totals.totalGoldPaid.toFixed(3)}</p>
                  <p>بیلانس طلا: {totals.goldBalance.toFixed(3)} ({totals.goldLabel})</p>
                  <p>تعداد خریدها: {totals.buyCount}</p>
                  <p>تعداد فروش‌ها: {totals.sellCount}</p>
                  <p>وضعیت مشتری: {totals.dollarBalance < 0 || totals.goldBalance < 0 ? 'باقی' : 'پاک'}</p>
                </div>

                {/* دکمه دانلود گزارش اکسل */}
                <button
                  onClick={handleDownloadReport}
                  className="mt-4 bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-lg w-full flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Download className="w-5 h-5" />
                  دانلود گزارش تراکنش‌ها
                </button>

              </div>
            ) : (
              <p>هیچ تراکنشی یافت نشد.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}