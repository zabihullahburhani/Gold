// frontend/src/components/MoneyLedgerAdmin.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import {
    fetchMoneyLedgers,
    createMoneyLedger,
    updateMoneyLedger,
    deleteMoneyLedger,
} from "../../services/money_ledger_api";
import { fetchCustomers } from "../../services/customers_api";
import { fetchCapitals } from "../../services/capital_api";
import moment from "moment-jalaali";
import { Loader2, Trash2, Edit, Search, Filter } from "lucide-react";
import Link from "next/link";

// --- تعریف واسط‌ها (Interfaces) ---
type TimeRange = "today" | "yesterday" | "day_before" | "current_week" | "current_month" | "all" | "custom";

interface Customer {
    customer_id: number;
    full_name: string;
    phone?: string;
}

interface Capital {
    id: number;
    usd_capital: number; // سرمایه کل دالر
    gold_capital: number;
    date: string;
}

interface MoneyLedger {
    money_ledger_id: number;
    customer_id: number;
    capital_id?: number;
    transaction_date: string;
    description: string;
    received: number;
    paid: number;
    heel_purity_carat?: number; // اختیاری، اگر نیاز باشد
    balance: number;
}

interface ExtendedMoneyLedger extends MoneyLedger {
    cumulative_balance: number;
}

interface MoneyLedgerPayload {
    customer_id: number;
    description: string;
    received: number;
    paid: number;
    heel_purity_carat?: number;
    transaction_date: string;
    capital_id?: number;
}

// --- ثابت‌ها و توابع کمکی ---
const ROWS_PER_PAGE = 10;
const DOLLAR_UNIT = "دالر";

const getRangeDates = (range: TimeRange, customStart?: string | null, customEnd?: string | null) => {
    let startDate: moment.Moment | null = null;
    let endDate: moment.Moment = moment().endOf('day');
    
    switch (range) {
        case 'today':
            startDate = moment().startOf('day');
            break;
        case 'yesterday':
            startDate = moment().subtract(1, 'days').startOf('day');
            endDate = moment().subtract(1, 'days').endOf('day');
            break;
        case 'day_before':
            startDate = moment().subtract(2, 'days').startOf('day');
            endDate = moment().subtract(2, 'days').endOf('day');
            break;
        case 'current_week':
            startDate = moment().startOf('week');
            break;
        case 'current_month':
            startDate = moment().startOf('month');
            break;
        case 'custom':
            if (customStart) startDate = moment(customStart, 'jYYYY-jMM-jDD').startOf('day');
            if (customEnd) endDate = moment(customEnd, 'jYYYY-jMM-jDD').endOf('day');
            break;
        case 'all':
        default:
            return { startDate: null, endDate: null };
    }
    
    return { 
        startDate: startDate ? startDate.toDate() : null, 
        endDate: endDate.toDate() 
    };
};

// --- کامپوننت اصلی ---
export default function MoneyLedgerAdmin() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [ledgers, setLedgers] = useState<MoneyLedger[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [capitals, setCapitals] = useState<Capital[]>([]);
    const [editingLedger, setEditingLedger] = useState<MoneyLedger | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [selectedRange, setSelectedRange] = useState<TimeRange>("today");
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [customerIdFilter, setCustomerIdFilter] = useState<number | null>(null);

    // --- Form State ---
    const initialFormState = useMemo(() => ({
        customer_id: "" as number | "",
        description: "",
        received: 0,
        paid: 0,
        heel_purity_carat: 0,
        date: moment().format("jYYYY-jMM-jDD"),
    }), []);
    const [form, setForm] = useState(initialFormState);
    
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // ----------------------------------------------
    // بارگیری داده‌ها
    // ----------------------------------------------
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (!token) {
                throw new Error("توکن احراز هویت یافت نشد");
            }

            // واکشی موازی داده‌ها
            const [ledgersData, customersData, capitalsData] = await Promise.all([
                fetchMoneyLedgers(token).catch(err => {
                    console.error("خطا در دریافت تراکنش‌ها:", err);
                    return [];
                }),
                fetchCustomers(token).catch(err => {
                    console.error("خطا در دریافت مشتریان:", err);
                    return [];
                }),
                fetchCapitals().catch(err => {
                    console.error("خطا در دریافت سرمایه‌ها:", err);
                    return [];
                })
            ]);

            // مرتب‌سازی تراکنش‌ها بر اساس تاریخ و سپس money_ledger_id (از قدیم به جدید)
            const sortedLedgers = Array.isArray(ledgersData) 
                ? ledgersData.sort((a: MoneyLedger, b: MoneyLedger) => {
                    const dateA = new Date(a.transaction_date).getTime();
                    const dateB = new Date(b.transaction_date).getTime();
                    return dateA - dateB || a.money_ledger_id - b.money_ledger_id;
                })
                : [];
            setLedgers(sortedLedgers);
            
            // تنظیم مشتریان
            let finalCustomers: Customer[] = [];
            if (Array.isArray(customersData)) {
                finalCustomers = customersData;
            } else if (customersData && Array.isArray(customersData.data)) {
                finalCustomers = customersData.data;
            } else if (customersData && customersData.customers) {
                finalCustomers = customersData.customers;
            }
            setCustomers(finalCustomers);
            if (finalCustomers.length === 0) {
                console.warn("هیچ مشتری‌ای دریافت نشد");
            }

            // تنظیم سرمایه‌ها
            let finalCapitals: Capital[] = [];
            if (Array.isArray(capitalsData)) {
                finalCapitals = capitalsData;
            } else if (capitalsData && Array.isArray(capitalsData.data)) {
                finalCapitals = capitalsData.data;
            } else if (capitalsData && Array.isArray(capitalsData.records)) {
                finalCapitals = capitalsData.records;
            }
            setCapitals(finalCapitals);
            if (finalCapitals.length === 0) {
                console.warn("هیچ سرمایه‌ای دریافت نشد");
            }

        } catch (err) {
            console.error("خطا در بارگذاری داده‌ها:", err);
            setError("خطا در بارگذاری داده‌ها. لطفاً صفحه را رفرش کنید.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { 
        loadData(); 
    }, [loadData]);

    // ----------------------------------------------
    // توابع کمکی
    // ----------------------------------------------
    const getCustomerName = (id: number) => {
        const customer = customers.find((c) => c.customer_id === id);
        return customer ? customer.full_name : `مشتری #${id}`;
    };

    const clearForm = () => {
        setEditingLedger(null);
        setForm(initialFormState);
        setError(null);
    };

    // --- مدیریت فرم و ارسال ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.customer_id) {
            setError("لطفاً یک مشتری انتخاب کنید");
            return;
        }

        if (form.received === 0 && form.paid === 0) {
            setError("حداقل یکی از مقادیر رسید یا گرفت باید پر شود");
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            if (!token) {
                throw new Error("توکن احراز هویت موجود نیست");
            }

            const gregDate = moment(form.date, 'jYYYY-jMM-jDD').format('YYYY-MM-DD');
            const payload: MoneyLedgerPayload = {
                customer_id: Number(form.customer_id),
                description: form.description.trim(),
                received: Number(form.received),
                paid: Number(form.paid),
                transaction_date: gregDate,
            };

            if (form.heel_purity_carat > 0) {
                payload.heel_purity_carat = Number(form.heel_purity_carat);
            }

            console.log("ارسال داده:", payload);

            if (editingLedger) {
                await updateMoneyLedger(token, editingLedger.money_ledger_id, payload);
            } else {
                await createMoneyLedger(token, payload);
            }

            clearForm();
            await loadData();
            
        } catch (err: any) {
            console.error("خطا در ثبت/ویرایش تراکنش:", err);
            setError(err.message || "خطا در ثبت اطلاعات. جزئیات در کنسول ثبت شد.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleEdit = (ledger: MoneyLedger) => {
        setEditingLedger(ledger);
        setError(null);
        
        const persianDate = moment(ledger.transaction_date).format("jYYYY-jMM-jDD");
        
        setForm({
            customer_id: ledger.customer_id,
            description: ledger.description,
            received: ledger.received,
            paid: ledger.paid,
            heel_purity_carat: ledger.heel_purity_carat || 0,
            date: persianDate,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("آیا مطمئن هستید که می‌خواهید این تراکنش را حذف کنید؟")) {
            return;
        }

        try {
            if (!token) {
                throw new Error("توکن احراز هویت موجود نیست");
            }
            
            await deleteMoneyLedger(token, id);
            await loadData();
            setError(null);
        } catch (err: any) {
            console.error("خطا در حذف تراکنش:", err);
            setError(err.message || "خطا در حذف تراکنش");
        }
    };

    // ----------------------------------------------
    // منطق فیلترینگ و محاسبه بیلانس
    // ----------------------------------------------
    const extendedLedgers: ExtendedMoneyLedger[] = useMemo(() => {
        // 1. فیلتر کردن بر اساس بازه زمانی
        const { startDate, endDate } = getRangeDates(selectedRange, customStartDate, customEndDate);
        
        let filtered = ledgers;
        
        if (startDate) {
            const startTimestamp = startDate.getTime();
            const endTimestamp = endDate.getTime();

            filtered = ledgers.filter(ledger => {
                const txnDate = new Date(ledger.transaction_date);
                const txnTimestamp = txnDate.getTime();
                return txnTimestamp >= startTimestamp && txnTimestamp <= endTimestamp;
            });
        }
        
        // 2. فیلتر کردن بر اساس مشتری
        if (customerIdFilter) {
            filtered = filtered.filter(l => l.customer_id === customerIdFilter);
        }

        // 3. محاسبه سرمایه اولیه (جمع usd_capital از تمام رکوردهای سرمایه)
        const initialCapital = capitals.reduce((sum, capital) => sum + (capital.usd_capital || 0), 0);

        // 4. محاسبه بیلانس تجمعی (شبیه به طلا)
        let cumulativeBalance = initialCapital;
        const cumulativeMap = new Map<number, number>();

        for (const ledger of ledgers) {
            cumulativeBalance += (ledger.received || 0) - (ledger.paid || 0);
            cumulativeMap.set(ledger.money_ledger_id, cumulativeBalance);
        }
        
        // 5. اعمال بیلانس تجمعی و معکوس کردن برای نمایش
        return filtered
            .map(ledger => ({
                ...ledger,
                cumulative_balance: cumulativeMap.get(ledger.money_ledger_id) || initialCapital,
            }))
            .reverse();
            
    }, [ledgers, selectedRange, customStartDate, customEndDate, customerIdFilter, capitals]);

    // ----------------------------------------------
    // منطق Pagination
    // ----------------------------------------------
    const totalPages = Math.ceil(extendedLedgers.length / ROWS_PER_PAGE);
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const currentLedgers = extendedLedgers.slice(startIndex, startIndex + ROWS_PER_PAGE);
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedRange, customerIdFilter, customStartDate, customEndDate]);

    // محاسبه سرمایه کل برای نمایش
    const totalUsdCapital = capitals.reduce((sum, capital) => sum + (capital.usd_capital || 0), 0);

    // --- کلاس‌های CSS و JSX ---
    const baseClasses = "px-3 py-2 text-sm border-b border-gray-700 border-l text-right";
    const headerClasses = "px-3 py-2 text-right text-xs font-medium text-gray-300 border-l border-gray-700 bg-gray-750";

    return (
        <div className="p-4 space-y-4 bg-gray-900 text-white min-h-screen font-inter rtl">
            {/* دکمه‌های ناوبری */}
            <div className="flex justify-center gap-4 mb-4">
                <Link href="/gold-ledger-admin">
                    <button
                        className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition"
                    >
                        GOLD
                    </button>
                </Link>
                <button
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                >
                    MONEY
                </button>
            </div>

            {/* نمایش خطا */}
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span>{error}</span>
                        <button 
                            onClick={() => setError(null)}
                            className="text-red-400 hover:text-red-200"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* نمایش سرمایه کل */}
            <Card className="bg-gray-800 p-4 rounded-xl border border-teal-700">
                <div className="text-sm text-gray-400">
                    سرمایه کل دالر: {totalUsdCapital.toFixed(2)} {DOLLAR_UNIT}
                </div>
            </Card>

            {/* فرم ثبت/ویرایش روزنامچه دالر */}
            <Card className="rounded-xl overflow-hidden bg-gray-800 p-4 shadow-xl border border-teal-700">
                <CardHeader className="pb-3">
                    <h1 className="text-2xl font-bold text-center text-teal-400">
                        📝 مدیریت روزنامچه دالر
                        {editingLedger && <span className="text-yellow-400 text-sm mr-2">(ویرایش)</span>}
                    </h1>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                        
                        {/* مشتری */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-gray-400">
                                👤 مشتری *
                            </label>
                            <select
                                value={form.customer_id}
                                onChange={(e) => setForm({...form, customer_id: e.target.value ? parseInt(e.target.value) : ""})}
                                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                required
                                disabled={customers.length === 0}
                            >
                                <option value="">{customers.length === 0 ? "در حال بارگیری..." : "یک مشتری انتخاب کنید"}</option>
                                {customers.map((customer) => (
                                    <option key={customer.customer_id} value={customer.customer_id}>
                                        {customer.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* تاریخ */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-400">
                                📅 تاریخ (شمسی) *
                            </label>
                            <input
                                type="text"
                                value={form.date}
                                onChange={(e) => setForm({...form, date: e.target.value})}
                                placeholder="مثال: 1403-05-15"
                                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-center focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                required
                            />
                        </div>

                        {/* رسیدها */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-400">
                                ⬇️ رسیدها ({DOLLAR_UNIT})
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={form.received}
                                onChange={(e) => setForm({...form, received: parseFloat(e.target.value) || 0})}
                                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                min={0}
                            />
                        </div>

                        {/* گرفت‌ها */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-400">
                                ⬆️ گرفت‌ها ({DOLLAR_UNIT})
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={form.paid}
                                onChange={(e) => setForm({...form, paid: parseFloat(e.target.value) || 0})}
                                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                min={0}
                            />
                        </div>

                        {/* عیار پاشنه (اختیاری، اگر نیاز باشد) */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-400">
                                💎 عیار پاشنه
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                value={form.heel_purity_carat}
                                onChange={(e) => setForm({...form, heel_purity_carat: parseFloat(e.target.value) || 0})}
                                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-yellow-300 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                min={0}
                                max={24}
                                placeholder="23.88"
                            />
                        </div>

                        {/* توضیحات */}
                        <div className="md:col-span-6">
                            <label className="block text-sm font-medium mb-1 text-gray-400">
                                توضیحات تراکنش
                            </label>
                            <input
                                type="text"
                                value={form.description}
                                onChange={(e) => setForm({...form, description: e.target.value})}
                                placeholder="شرح کامل تراکنش (اختیاری)"
                                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* دکمه‌ها */}
                        <div className="md:col-span-6 flex justify-end gap-2 pt-2 border-t border-gray-700">
                            {editingLedger && (
                                <button
                                    type="button"
                                    onClick={clearForm}
                                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition"
                                >
                                    انصراف
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSaving || !form.customer_id || (form.received === 0 && form.paid === 0)}
                                className={`px-6 py-2 rounded-lg font-medium transition ${
                                    isSaving || !form.customer_id || (form.received === 0 && form.paid === 0) 
                                        ? "bg-gray-500 cursor-not-allowed text-gray-300" 
                                        : "bg-teal-600 hover:bg-teal-700 text-white"
                                }`}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin inline ml-1" />
                                ) : null}
                                {isSaving ? "در حال ثبت..." : editingLedger ? "بروزرسانی تراکنش" : "ثبت تراکنش"}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* بخش فیلترینگ */}
            <Card className="bg-gray-800 p-4 rounded-xl border border-teal-700">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
                        {/* فیلتر زمانی */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-teal-400" />
                            <label htmlFor="timeRange" className="text-sm font-medium text-gray-400 whitespace-nowrap">
                                بازه زمانی:
                            </label>
                            <select
                                id="timeRange"
                                value={selectedRange}
                                onChange={(e) => setSelectedRange(e.target.value as TimeRange)}
                                className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
                            >
                                <option value="today">امروز</option>
                                <option value="yesterday">دیروز</option>
                                <option value="day_before">پاروز</option>
                                <option value="current_week">هفته جاری</option>
                                <option value="current_month">ماه جاری</option>
                                <option value="custom">انتخابی</option>
                                <option value="all">همه تراکنش‌ها</option>
                            </select>
                        </div>
                        
                        {/* فیلتر مشتری */}
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-teal-400" />
                            <label htmlFor="customerFilter" className="text-sm font-medium text-gray-400 whitespace-nowrap">
                                فیلتر مشتری:
                            </label>
                            <select
                                id="customerFilter"
                                value={customerIdFilter || ""}
                                onChange={(e) => setCustomerIdFilter(e.target.value ? parseInt(e.target.value) : null)}
                                className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm min-w-[150px]"
                                disabled={customers.length === 0}
                            >
                                <option value="">همه مشتریان</option>
                                {customers.map((customer) => (
                                    <option key={customer.customer_id} value={customer.customer_id}>
                                        {customer.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* تاریخ‌های سفارشی */}
                        {selectedRange === 'custom' && (
                            <div className="flex items-center gap-2 border-r border-gray-600 pr-3">
                                <label className="text-sm font-medium text-gray-400 whitespace-nowrap">
                                    از:
                                </label>
                                <input
                                    type="text"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    placeholder="1403-01-01"
                                    className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm w-28 text-center"
                                />
                                <label className="text-sm font-medium text-gray-400 whitespace-nowrap">
                                    تا:
                                </label>
                                <input
                                    type="text"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    placeholder="1403-01-31"
                                    className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm w-28 text-center"
                                />
                            </div>
                        )}
                    </div>

                    <div className="text-sm text-gray-400">
                        تعداد کل: {extendedLedgers.length} تراکنش
                    </div>
                </div>
            </Card>

            {/* جدول نمایش تراکنش‌ها */}
            <Card className="rounded-xl overflow-hidden bg-gray-800 p-4 shadow-xl border border-teal-700">
                <CardHeader className="pb-3">
                    <h3 className="text-xl font-bold text-teal-400">جدول روزنامچه دالر</h3>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-8 text-teal-400">
                            <Loader2 className="w-6 h-6 animate-spin ml-2" />
                            در حال بارگیری تراکنش‌ها...
                        </div>
                    ) : currentLedgers.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            <p>هیچ تراکنشی در این بازه زمانی یافت نشد.</p>
                            {customers.length === 0 && (
                                <p className="text-yellow-400 mt-2">⚠️ هیچ مشتری‌ای در سیستم وجود ندارد.</p>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-lg border border-gray-700">
                                <table className="min-w-full divide-y divide-gray-700 border-collapse">
                                    <thead className="bg-gray-750 sticky top-0">
                                        <tr>
                                            <th className={`${headerClasses} border-r`}>#</th>
                                            <th className={headerClasses}>تاریخ و زمان</th>
                                            <th className={headerClasses}>مشتری</th>
                                            <th className={headerClasses}>شرح تراکنش</th>
                                            <th className={headerClasses}>عیار</th>
                                            <th className={headerClasses}>رسید ({DOLLAR_UNIT})</th>
                                            <th className={headerClasses}>گرفت ({DOLLAR_UNIT})</th>
                                            <th className={headerClasses}>بیلانس تجمعی ({DOLLAR_UNIT})</th>
                                            <th className={headerClasses}>عملیات</th>
                                        </tr>
                                    </thead>

                                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                                        {currentLedgers.map((ledger, index) => {
                                            const balanceClass = ledger.cumulative_balance < 0 
                                                ? "text-red-400" 
                                                : ledger.cumulative_balance > 0 
                                                    ? "text-green-400" 
                                                    : "text-gray-400";
                                            const persianDate = moment(ledger.transaction_date).format("jYYYY/jMM/jDD - HH:mm");
                                            const rowNumber = startIndex + index + 1;
                                            return (
                                                <tr key={ledger.money_ledger_id} className="hover:bg-gray-750 transition-colors">
                                                    <td className={`${baseClasses} border-r text-center`}>
                                                        {rowNumber}
                                                    </td>
                                                    <td className={`${baseClasses} whitespace-nowrap text-xs`}>
                                                        {persianDate}
                                                    </td>
                                                    <td className={`${baseClasses} font-medium`}>
                                                        {getCustomerName(ledger.customer_id)}
                                                    </td>
                                                    <td className={`${baseClasses} max-w-xs`}>
                                                        <div className="truncate" title={ledger.description}>
                                                            {ledger.description || '-'}
                                                        </div>
                                                    </td>
                                                    <td className={`${baseClasses} text-center`}>
                                                        {ledger.heel_purity_carat?.toFixed(3) || '-'}
                                                    </td>
                                                    <td className={`${baseClasses} text-green-300 font-mono text-center`}>
                                                        {ledger.received > 0 ? ledger.received.toFixed(4) : '-'}
                                                    </td>
                                                    <td className={`${baseClasses} text-red-300 font-mono text-center`}>
                                                        {ledger.paid > 0 ? ledger.paid.toFixed(4) : '-'}
                                                    </td>
                                                    <td className={`${baseClasses} font-bold font-mono text-center ${balanceClass}`}>
                                                        {ledger.cumulative_balance.toFixed(4)}
                                                    </td>
                                                    <td className={`${baseClasses} border-l-0`}>
                                                        <div className="flex justify-center gap-1">
                                                            <button 
                                                                onClick={() => handleEdit(ledger)} 
                                                                className="text-blue-400 hover:text-blue-300 p-1 transition"
                                                                title="ویرایش"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(ledger.money_ledger_id)} 
                                                                className="text-red-400 hover:text-red-300 p-1 transition"
                                                                title="حذف"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-4 p-3 rounded-xl border border-gray-700 bg-gray-750">
                                    <button 
                                        onClick={handlePrevPage} 
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                                            currentPage === 1 
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                                : 'bg-teal-600 hover:bg-teal-700 text-white'
                                        }`}
                                    >
                                        ◀️ قبلی
                                    </button>
                                    
                                    <span className="text-gray-300 text-sm">
                                        صفحه {currentPage} از {totalPages} - 
                                        <span className="text-teal-400 mr-1"> {extendedLedgers.length}</span> 
                                        تراکنش
                                    </span>

                                    <button 
                                        onClick={handleNextPage} 
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                                            currentPage === totalPages 
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                                : 'bg-teal-600 hover:bg-teal-700 text-white'
                                        }`}
                                    >
                                        بعدی ▶️
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}