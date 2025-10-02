// frontend/src/components/App.tsx (صفحه فعال سازی و داشبورد اصلی)

import React, { useState, useEffect, useCallback } from 'react';
// فرض بر این است که مسیرها و توابع API شما درست است
import { 
    getHardwareIDs, 
    checkActivationStatus, 
    createActivationRequest as requestActivation, 
    activateCode as validateActivation 
} from '../services/app_activations_api';

// -------------------------------------------------------------------------
// ⚛️ 1. محافظ (AuthGuard) - منطق قفل کردن برنامه
// -------------------------------------------------------------------------
const AuthGuard = ({ children, isActivated }) => {
    if (!isActivated) {
        return (
            <div className="text-center p-8 bg-red-800/10 border-2 border-red-500 rounded-xl mt-4">
                <h2 className="text-2xl font-bold text-red-400">
                    {/* 🎯 پیام مهم: اگر منقضی شده باشد، اینجا نمایش داده می‌شود */}
                    ⚠️ دسترسی محدود شده است!
                </h2>
                <p className="text-gray-300 mt-2">
                    لطفاً برنامه را فعال کنید یا کد فعال‌سازی جدید را وارد نمایید.
                </p>
                <p className="text-sm text-red-300 mt-1">
                    تاریخ انقضا شما سپری شده یا هنوز فعال‌سازی صورت نگرفته است.
                </p>
            </div>
        );
    }
    return children;
};

// -------------------------------------------------------------------------
// ⚛️ 2. کامپوننت اصلی
// -------------------------------------------------------------------------

export default function App() {
    const [status, setStatus] = useState({ 
        is_active: false, 
        remaining_days: 0, 
        expiration_date: null 
    });
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const hardwareIDs = getHardwareIDs();
    const motherboardCode = hardwareIDs.motherboard_code;
    
    // -------------------------------------
    // 1. Activation Status Check
    // -------------------------------------
    
    // 🎯 تابع بررسی وضعیت از سرور
    const loadStatus = useCallback(async () => {
        if (!motherboardCode) return;
        try {
            const data = await checkActivationStatus(motherboardCode);
            setStatus(data);
        } catch (error) {
            console.error("Failed to load status:", error);
            setMessage("خطا در بررسی وضعیت فعال‌سازی. لطفا سرور را چک کنید.");
        }
    }, [motherboardCode]);

    useEffect(() => {
        loadStatus();
    }, [loadStatus]);

    // -------------------------------------
    // 2. Validate Code Logic (اجرای کد فعال سازی)
    // -------------------------------------
    
    // 🎯 فراخوانی API POST /validate
    const handleValidate = async () => {
        setLoading(true);
        setMessage('');
        
        // ⚠️ مطمئن شوید که کد فعال‌سازی وارد شده توسط کاربر در دیتابیس توسط شما ست شده باشد!
        try {
            // 🎯 این فراخوانی به Backend می‌گوید کد وارد شده را چک کن و اگر درست بود، 6 ماه فعال کن.
            const result = await validateActivation(motherboardCode, code); 
            
            // نمایش پیام موفقیت آمیز
            setMessage(`✅ فعال‌سازی موفقیت‌آمیز! انقضا در ${new Date(result.expiration_date).toLocaleDateString('fa-IR')}`);
            setCode('');
            
            // 🎯 بلافاصله وضعیت جدید را بارگذاری می‌کند (is_active: true, remaining_days: 180)
            loadStatus(); 
        } catch (error: any) {
            console.error("Validation Error:", error);
            setMessage(error.message || "❌ کد فعال‌سازی اشتباه است یا خطایی رخ داده است.");
        } finally {
            setLoading(false);
        }
    };
    
    // -------------------------------------
    // 3. UI Rendering
    // -------------------------------------

    const isAppEnabled = status.is_active && status.remaining_days > 0;
    
    const statusText = isAppEnabled
        ? `فعال ( ${status.remaining_days} روز باقی مانده )`
        : (status.expiration_date ? 'منقضی شده' : 'ثبت نشده');

    return (
        <div className="p-4 sm:p-8 bg-gray-900 min-h-screen text-white font-inter">
            <div className="max-w-xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-yellow-500 text-center">سیستم فعال‌سازی نرم‌افزار</h1>
                
                {/* بخش وضعیت فعلی */}
                <div className="p-4 bg-gray-800 rounded-lg shadow-xl border-t-4 border-yellow-500">
                    <h2 className="text-xl font-semibold mb-2">وضعیت فعال‌سازی</h2>
                    <p className="text-sm">
                        وضعیت: <span className={`font-bold ${isAppEnabled ? 'text-green-400' : 'text-red-400'}`}>{statusText}</span>
                    </p>
                    <p className="text-sm">
                        کد سخت افزار (Motherboard ID): <span className="font-mono text-yellow-500 break-words">{motherboardCode}</span>
                    </p>
                </div>

                {/* --- بخش فعال سازی --- */}
                <div className="space-y-4">
                    {/* وارد کردن کد فعال سازی */}
                    <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
                        <h3 className="text-lg font-semibold mb-3">وارد کردن کد فعال سازی</h3>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="کد فعالسازی دریافتی از ادمین را وارد کنید (59340CA5-B9C6FEB4...)"
                            className="w-full p-2 mb-4 text-sm text-black rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <button 
                            onClick={handleValidate}
                            disabled={loading || code.length < 5}
                            className={`w-full py-2 rounded font-semibold transition-all ${
                                loading || code.length < 5
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                            {loading ? 'درحال اعتبار سنجی...' : 'فعال‌سازی برنامه'}
                        </button>
                    </div>
                </div>

                {/* پیام ها */}
                {message && (
                    <div className={`p-3 rounded text-sm ${message.includes('موفقیت') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                        {message}
                    </div>
                )}
        
                {/* قفل کردن امکانات اصلی برنامه توسط AuthGuard */}
                {/* 🎯 شرط قفل: is_active AND remaining_days > 0 باشد */}
                <AuthGuard isActivated={isAppEnabled}>
                    <div className="p-8 bg-blue-900/20 border-2 border-blue-500 rounded-xl">
                        <h2 className="text-2xl font-bold text-blue-300">👋 خوش آمدید!</h2>
                        <p className="text-gray-200 mt-2">اینجا بخش اصلی برنامه مدیریت طلا و بدهی است. تمامی امکانات برای شما فعال است.</p>
                        {/* ⚠️ نکته: تمامی کامپوننت های اصلی دیگر (GoldRates, Customers) باید در داخل این AuthGuard قرار گیرند. */}
                    </div>
                </AuthGuard>

            </div>
        </div>
    );
}