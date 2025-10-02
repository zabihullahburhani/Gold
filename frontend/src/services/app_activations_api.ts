// frontend/src/services/app_activations_api.ts

// ⚠️ فرض بر این است که تایپ‌ها و اینترفیس‌ها در یک فایل (مثلاً types/activation.ts) تعریف شده‌اند
// import { ActivationRequest, ActivationCodeValidation, ActivationStatusOut } from "../types/activation"; 

// 🎯 تنظیم URL پایه
// فرض می‌کنیم prefix شما /api/v1 است و endpoint شما /activations است.
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1") + "/activations";


// 📌 1. گرفتن لیست همه فعال‌سازی‌ها (برای پنل ادمین)
export async function fetchActivations() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("خطا در بارگذاری لیست فعال‌سازی‌ها. مطمئن شوید Endpoint فعال است.");
  return res.json();
}

// 📌 2. ارسال درخواست فعال‌سازی (توسط کاربر یا ادمین)
export async function createActivationRequest(payload: any /* ActivationRequest */) {
  const res = await fetch(API_BASE + "/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.detail || "خطا در ارسال درخواست فعال‌سازی");
  }
  return res.json();
}

// 📌 3. فعال کردن برنامه با کد دریافتی (validate)
export async function activateCode(
  motherboard_code: string,
  activation_code: string
) {
  const res = await fetch(API_BASE + "/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ motherboard_code, activation_code }),
  });
  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.detail || "کد فعال‌سازی معتبر نیست یا خطا رخ داده");
  }
  return res.json();
}

// 📌 4. گرفتن وضعیت فعال‌سازی (برای AuthGuard)
export async function getActivationStatus(motherboard_code: string) {
  const res = await fetch(`${API_BASE}/status/${motherboard_code}`);
  if (!res.ok) throw new Error("خطا در بررسی وضعیت فعال‌سازی");
  return res.json();
}

// 🎯 تابع کمکی برای شبیه‌سازی خواندن ID ها (همان که قبلاً داشتید)
export const detectHardware = () => {
    // ⚠️ در عمل باید این کدها از سیستم عامل خوانده شود
    return ["MB-123-DEMO-USER-1"]; 
};
