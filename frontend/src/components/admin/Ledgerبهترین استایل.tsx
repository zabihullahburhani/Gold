import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Loader2, Trash2, Edit } from "lucide-react"; 

// ====================================================================
// ۱. تنظیمات و توابع API و مدل‌ها
// ====================================================================

// --- مدل‌ها ---
interface Customer {
    customer_id: number;
    full_name: string;
}
interface Capital {
    id: number;
    usd_capital: number;
    gold_capital: number;
    date: string;
}
interface MoneyLedger {
    id: number;
    customer_id: number;
    capital_id?: number;
    transaction_date: string;
    description: string;
    received: number;
    paid: number;
    balance: number;
}
interface GoldLedger extends MoneyLedger {
    heel_purity_carat?: number;
}
type TabType = "money" | "gold";

// --- تنظیمات پایه ---
const getAuthToken = () => "YOUR_MOCK_AUTH_TOKEN"; 
const API_BASE = "http://localhost:8000";
const BASE_LEDGER_URL = `${API_BASE}/api/v1/ledger`;
const CUSTOMER_URL = `${API_BASE}/api/v1/customers`;
const CAPITAL_URL = `${API_BASE}/api/v1/capital`; 

/** تابع کمکی برای فراخوانی API با توکن */
const apiCall = async (method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data = null) => {
    const token = getAuthToken();
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        let res;
        if (method === 'GET') res = await axios.get(url, config);
        else if (method === 'POST') res = await axios.post(url, data, config);
        else if (method === 'PUT') res = await axios.put(url, data, config);
        else if (method === 'DELETE') res = await axios.delete(url, config);
        return res.data;
    } catch (error) {
        console.error(`Error in ${method} ${url}:`, error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};

// --- توابع واکشی ---
export const fetchCustomers = async () => (await apiCall('GET', CUSTOMER_URL));
export const fetchCapital = async () => (await apiCall('GET', CAPITAL_URL)); 
export const fetchMoneyLedgers = async () => (await apiCall('GET', BASE_LEDGER_URL)).data || [];
export const fetchGoldLedgers = async () => (await apiCall('GET', `${BASE_LEDGER_URL}/gold`)).data || [];

// --- توابع CRUD ---
export const createMoneyLedger = async (data: any) => (await apiCall('POST', `${BASE_LEDGER_URL}/money`, data));
export const updateMoneyLedger = async (id: number, data: any) => (await apiCall('PUT', `${BASE_LEDGER_URL}/money/${id}`, data));
export const deleteMoneyLedger = async (id: number) => (await apiCall('DELETE', `${BASE_LEDGER_URL}/money/${id}`));
export const createGoldLedger = async (data: any) => (await apiCall('POST', `${BASE_LEDGER_URL}/gold`, data));
export const updateGoldLedger = async (id: number, data: any) => (await apiCall('PUT', `${BASE_LEDGER_URL}/gold/${id}`, data));
export const deleteGoldLedger = async (id: number) => (await apiCall('DELETE', `${BASE_LEDGER_URL}/gold/${id}`));


// ====================================================================
// ۲. کامپوننت‌های کمکی UI
// ====================================================================

/** تابع جایگزین برای تبدیل تاریخ میلادی به شمسی (با استفاده از Intl) */
const toPersianDate = (gregDateString: string) => {
    try {
        const date = new Date(gregDateString);
        if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
            return new Intl.DateTimeFormat('fa-IR', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', hour12: false
            }).format(date).replace(/\//g, '/');
        }
        const [datePart, timePart] = gregDateString.split('T');
        if (timePart) return `${datePart} ${timePart.slice(0, 5)}`;
        return datePart;
    } catch (e) { return "تاریخ نامعتبر"; }
};

// --- UI Components ---
const Card = ({ children, className = "" }) => (<div className={`rounded-xl shadow-2xl ${className}`}>{children}</div>);
const CardHeader = ({ children, className = "" }) => (<div className={`p-4 border-b border-gray-700 ${className}`}>{children}</div>);
const CardContent = ({ children, className = "" }) => (<div className={`p-4 ${className}`}>{children}</div>);

/** Modal برای جایگزینی confirm */
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-sm text-right rtl border border-red-600">
                <p className="mb-4 text-sm text-white font-semibold">{message}</p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 text-xs rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition"
                    >خیر</button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition"
                    >بله، حذف کن</button>
                </div>
            </div>
        </div>
    );
};


// ====================================================================
// ۳. کامپوننت اصلی LedgerTabs
// ====================================================================

function LedgerTabs() {
    const [activeTab, setActiveTab] = useState<TabType>("money");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [capital, setCapital] = useState<Capital | null>(null);

    const [moneyLedgers, setMoneyLedgers] = useState<MoneyLedger[]>([]);
    const [goldLedgers, setGoldLedgers] = useState<GoldLedger[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ledgerToDelete, setLedgerToDelete] = useState(null);

    const initialFormState = useMemo(() => ({
        customer_id: 0,
        description: "",
        received: 0,
        paid: 0,
        heel_purity_carat: 0,
        // تنظیم تاریخ پیش‌فرض به فرمت مورد نیاز input[datetime-local]
        date: new Date().toISOString().slice(0, 16), 
    }), []);

    const [form, setForm] = useState(initialFormState);
    const [editingLedger, setEditingLedger] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // --- بارگذاری داده‌ها ---
    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const [moneyData, goldData, custData, capData] = await Promise.all([
                fetchMoneyLedgers(), 
                fetchGoldLedgers(),
                fetchCustomers(), // ⭐️ واکشی لیست مشتریان
                fetchCapital(),
            ]);
            
            setMoneyLedgers(moneyData);
            setGoldLedgers(goldData);
            setCustomers(custData); // ⭐️ ذخیره لیست مشتریان
            setCapital(capData && capData.length > 0 ? capData[0] : null); 
        } catch (err) {
            setError("خطا در بارگذاری داده‌ها. لطفاً از اتصال API و فعال بودن بک‌اند اطمینان حاصل کنید.");
            console.error("خطا در بارگذاری داده‌های دفترچه:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // --- محاسبه بیلانس (با فرض اینکه تاریخ‌ها به ترتیب باشند) ---
    const calculateBalance = (ledgers: (MoneyLedger | GoldLedger)[], initial: number) => {
        // مرتب‌سازی بر اساس تاریخ برای محاسبه صحیح بیلانس
        const sortedLedgers = [...ledgers].sort((a, b) => {
            return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
        });

        let currentBalance = initial;
        
        return sortedLedgers.map((item) => {
            const received = item.received || 0;
            const paid = item.paid || 0;
            currentBalance = currentBalance + received - paid;
            // ⭐️ بازگرداندن تراکنش با بیلانس محاسبه شده
            return { ...item, balance: currentBalance }; 
        });
    };

    // --- مدیریت بیلانس در UI ---
    const displayedMoneyLedgers = useMemo(
        // محاسبه و سپس نمایش معکوس برای دیدن آخرین تراکنش‌ها در بالا
        () => (capital ? calculateBalance(moneyLedgers, capital.usd_capital).reverse() : moneyLedgers),
        [moneyLedgers, capital]
    );

    const displayedGoldLedgers = useMemo(
        // محاسبه و سپس نمایش معکوس برای دیدن آخرین تراکنش‌ها در بالا
        () => (capital ? calculateBalance(goldLedgers, capital.gold_capital).reverse() : goldLedgers),
        [goldLedgers, capital]
    );

    // --- ثبت یا ویرایش ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.customer_id === 0) return setError("لطفا یک مشتری انتخاب کنید.");
        
        setIsSaving(true);
        setError("");
        try {
            const payload = {
                customer_id: form.customer_id,
                description: form.description,
                received: form.received,
                paid: form.paid,
                // ارسال تاریخ به عنوان transaction_date با منطقه زمانی فرضی
                transaction_date: `${form.date}:00+03:30`, 
                capital_id: capital?.id || null 
            };
            
            if (activeTab === "gold") payload.heel_purity_carat = form.heel_purity_carat;

            if (activeTab === "money") {
                if (editingLedger) await updateMoneyLedger(editingLedger.id, payload);
                else await createMoneyLedger(payload);
            } else {
                if (editingLedger) await updateGoldLedger(editingLedger.id, payload);
                else await createGoldLedger(payload);
            }

            // ریست فرم
            setForm(initialFormState);
            setEditingLedger(null);
            loadData();
        } catch (err) {
            setError(`خطا در ثبت یا ویرایش تراکنش. جزئیات: ${JSON.stringify(err)}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    // --- ویرایش ---
    const handleEdit = (ledger: MoneyLedger | GoldLedger) => {
        setEditingLedger(ledger);
        const dateString = ledger.transaction_date.slice(0, 16); // فرمت 'YYYY-MM-DDTHH:mm'
        
        setForm({
            customer_id: ledger.customer_id,
            description: ledger.description,
            received: ledger.received || 0,
            paid: ledger.paid || 0,
            heel_purity_carat: (ledger as GoldLedger).heel_purity_carat || 0,
            date: dateString, 
        });
    };

    // --- حذف ---
    const openDeleteModal = (ledger: MoneyLedger | GoldLedger) => {
        setLedgerToDelete(ledger);
        setIsModalOpen(true);
    };
    
    const confirmDelete = async () => {
        setIsModalOpen(false);
        if (!ledgerToDelete) return;
        
        try {
            if (activeTab === "money") await deleteMoneyLedger(ledgerToDelete.id);
            else await deleteGoldLedger(ledgerToDelete.id);
            loadData();
        } catch (err) {
            setError("خطا در حذف تراکنش. جزئیات را در کنسول ببینید.");
        } finally {
            setLedgerToDelete(null);
        }
    };

    // --- فرم ثبت تراکنش ---
    const LedgerForm = () => {
        const isGold = activeTab === "gold";
        const gridColumns = isGold ? "md:grid-cols-7" : "md:grid-cols-6";
        
        return (
            <form onSubmit={handleSubmit} className={`grid grid-cols-2 ${gridColumns} gap-3 items-end p-4 bg-gray-900 rounded-xl shadow-lg border border-gray-700 rtl`}>
                <div className="col-span-2 md:col-span-1">
                    <label className="text-xs text-gray-400 block mb-1">مشتری</label>
                    <select
                        value={form.customer_id}
                        onChange={(e) => setForm({ ...form, customer_id: parseInt(e.target.value) })}
                        className="w-full p-2 rounded-lg bg-gray-700 text-white text-sm border border-gray-600 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
                    >
                        <option value={0}>انتخاب کنید</option>
                        {/* ⭐️ لیست کردن مشتریان */}
                        {customers.map((c) => (
                            <option key={c.customer_id} value={c.customer_id}>{c.full_name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">رسیدها ({isGold ? 'توله' : 'دالر'})</label>
                    <input
                        type="number"
                        step={isGold ? "0.0001" : "0.01"}
                        value={form.received}
                        onChange={(e) => setForm({ ...form, received: parseFloat(e.target.value || 0) })}
                        className="w-full p-2 rounded-lg bg-gray-700 text-white text-sm border border-gray-600 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
                        placeholder="0"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">گرفت‌ها ({isGold ? 'توله' : 'دالر'})</label>
                    <input
                        type="number"
                        step={isGold ? "0.0001" : "0.01"}
                        value={form.paid}
                        onChange={(e) => setForm({ ...form, paid: parseFloat(e.target.value || 0) })}
                        className="w-full p-2 rounded-lg bg-gray-700 text-white text-sm border border-gray-600 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
                        placeholder="0"
                    />
                </div>
                {isGold && (
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">عیار پاشنه</label>
                        <input
                            type="number"
                            step="0.001"
                            value={form.heel_purity_carat}
                            onChange={(e) => setForm({ ...form, heel_purity_carat: parseFloat(e.target.value || 0) })}
                            className="w-full p-2 rounded-lg bg-gray-700 text-white text-sm border border-gray-600 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
                            placeholder="750"
                        />
                    </div>
                )}
                <div className="col-span-2 md:col-span-1">
                    <label className="text-xs text-gray-400 block mb-1">تاریخ</label>
                    <input
                        type="datetime-local"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full p-2 rounded-lg bg-gray-700 text-white text-sm border border-gray-600 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
                    />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="text-xs text-gray-400 block mb-1">تفصیل</label>
                    <input
                        type="text"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full p-2 rounded-lg bg-gray-700 text-white text-sm border border-gray-600 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
                        placeholder="توضیحات تراکنش"
                    />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <button
                        type="submit"
                        disabled={isSaving || !form.customer_id}
                        className={`w-full py-2 rounded-lg text-white text-sm font-bold transition duration-150 flex items-center justify-center ${
                            isSaving || !form.customer_id ? "bg-gray-500 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/50"
                        }`}
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingLedger ? "ویرایش" : "ثبت تراکنش"}
                    </button>
                </div>
            </form>
        );
    };

    // --- جدول تراکنش‌ها ---
    const LedgerTable = ({ ledgers }: { ledgers: (MoneyLedger | GoldLedger)[] }) => {
        const isGold = activeTab === "gold";
        const totalColumns = isGold ? 9 : 8;
        const unit = isGold ? 'توله' : 'دالر';
        const fixedDecimal = isGold ? 4 : 2;
        
        // ⭐️ ایجاد نقشه (Map) از مشتریان برای جستجوی سریع
        const customerMap = useMemo(() => {
            return customers.reduce((acc, curr) => {
                acc[curr.customer_id] = curr.full_name;
                return acc;
            }, {} as Record<number, string>);
        }, [customers]);

        return (
            <div className="overflow-x-auto rounded-xl border border-gray-700 mt-4 shadow-xl">
                <table className="min-w-full divide-y divide-gray-700 text-right rtl">
                    <thead className="bg-gray-700 sticky top-0 shadow-inner">
                        <tr>
                            <th className="px-2 py-2 text-xs font-medium text-gray-300 w-12">#</th>
                            <th className="px-2 py-2 text-xs font-medium text-gray-300 w-36">تاریخ و زمان</th>
                            <th className="px-2 py-2 text-xs font-medium text-gray-300 w-40">مشتری</th>
                            <th className="px-2 py-2 text-xs font-medium text-gray-300">تفصیل</th>
                            <th className="px-2 py-2 text-xs font-medium text-gray-300 w-24">رسید ({unit})</th>
                            <th className="px-2 py-2 text-xs font-medium text-gray-300 w-24">گرفت ({unit})</th>
                            {isGold && <th className="px-2 py-2 text-xs font-medium text-gray-300 w-20">پاشنه (عیار)</th>}
                            <th className="px-2 py-2 text-xs font-medium text-gray-300 w-28">بیلانس ({unit})</th>
                            <th className="px-2 py-2 text-xs font-medium text-gray-300 text-center w-24">عملیات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 bg-gray-800 text-white">
                        {isLoading ? (
                            <tr><td colSpan={totalColumns} className="text-center py-6 text-sm text-gray-400">
                                <Loader2 className="w-6 h-6 mx-auto animate-spin text-teal-400" />
                                <span className="mt-2 block">در حال بارگذاری داده‌ها...</span>
                            </td></tr>
                        ) : ledgers.length === 0 ? (
                            <tr><td colSpan={totalColumns} className="text-center py-6 text-sm text-gray-400">
                                هیچ تراکنشی یافت نشد.
                            </td></tr>
                        ) : (
                            ledgers.map((l) => {
                                // ⭐️ استفاده از customerMap برای یافتن نام مشتری
                                const custName = customerMap[l.customer_id] || "--- مشتری نامشخص ---"; 
                                const balanceClass = l.balance < 0 ? "text-red-400" : "text-green-400";
                                return (
                                    <tr key={l.id} className="hover:bg-gray-700 transition">
                                        <td className="px-2 py-2 text-xs text-center">{l.id}</td>
                                        <td className="px-2 py-2 text-xs text-gray-400">{toPersianDate(l.transaction_date)}</td>
                                        <td className="px-2 py-2 text-xs font-medium">{custName}</td>
                                        <td className="px-2 py-2 text-xs truncate max-w-xs">{l.description}</td>
                                        <td className="px-2 py-2 text-xs text-green-300 font-mono">{l.received ? l.received.toFixed(fixedDecimal) : "0.00"}</td>
                                        <td className="px-2 py-2 text-xs text-red-300 font-mono">{l.paid ? l.paid.toFixed(fixedDecimal) : "0.00"}</td>
                                        {isGold && <td className="px-2 py-2 text-xs font-mono">{(l as GoldLedger).heel_purity_carat ? (l as GoldLedger).heel_purity_carat.toFixed(3) : "0.000"}</td>}
                                        <td className={`px-2 py-2 text-xs font-bold font-mono ${balanceClass}`}>{l.balance.toFixed(fixedDecimal)}</td>
                                        <td className="px-2 py-2 text-xs flex justify-center space-x-2 space-x-reverse">
                                            <button 
                                                className="text-blue-400 hover:text-blue-300 transition p-1" 
                                                onClick={() => handleEdit(l)}
                                                title="ویرایش"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                className="text-red-400 hover:text-red-300 transition p-1" 
                                                onClick={() => openDeleteModal(l)}
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <Card className="bg-gray-800 text-white max-w-7xl w-full mx-auto">
            <CardHeader className="p-4 border-b border-gray-700 mb-4">
                <div className="flex justify-between items-center flex-wrap gap-3">
                    <h1 className="text-2xl font-extrabold text-teal-400">سیستم مدیریت روزنامچه‌ها</h1>
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-2 text-sm rounded-lg font-bold transition ${activeTab === "money" ? "bg-teal-600 shadow-lg shadow-teal-500/30" : "bg-gray-600 hover:bg-gray-700"}`}
                            onClick={() => setActiveTab("money")}
                        >روزنامچه پول (دالر)</button>
                        <button
                            className={`px-4 py-2 text-sm rounded-lg font-bold transition ${activeTab === "gold" ? "bg-teal-600 shadow-lg shadow-teal-500/30" : "bg-gray-600 hover:bg-gray-700"}`}
                            onClick={() => setActiveTab("gold")}
                        >روزنامچه طلا (توله)</button>
                    </div>
                </div>
                {capital && (
                    <div className="mt-4 text-sm text-gray-300 border-t border-gray-700 pt-2 flex justify-start items-center">
                        <span className="font-medium ml-2">سرمایه کل:</span>
                        <span className="font-bold text-xl mr-2 text-yellow-400">
                            {activeTab === "money" ? `${capital.usd_capital.toFixed(2)} دالر` : `${capital.gold_capital.toFixed(4)} توله`}
                        </span>
                    </div>
                )}
                {error && (
                    <div className="mt-2 p-2 bg-red-800 text-red-100 text-xs rounded-lg border border-red-600">
                        {error}
                    </div>
                )}
            </CardHeader>
            
            <CardContent className="p-4">
                <LedgerForm />
                {activeTab === "money" ? <LedgerTable ledgers={displayedMoneyLedgers} /> : <LedgerTable ledgers={displayedGoldLedgers} />}
            </CardContent>

            <ConfirmationModal
                isOpen={isModalOpen}
                message="آیا مطمئن هستید که می‌خواهید این تراکنش را حذف کنید؟ این عمل غیرقابل بازگشت است و بر بیلانس تأثیر می‌گذارد."
                onConfirm={confirmDelete}
                onCancel={() => setIsModalOpen(false)}
            />
        </Card>
    );
}

// کامپوننت اصلی برای اطمینان از خروجی تکی
export default function App() {
    useEffect(() => {
        // بارگذاری Tailwind CSS
        const link = document.createElement('script');
        link.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(link);
    }, []);

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-900 p-4 font-[Inter] rtl">
            <LedgerTabs />
        </div>
    );
}
