// frontend/src/services/app_activations_api.ts

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1/activations";

// 📌 گرفتن لیست همه فعال‌سازی‌ها
export async function fetchActivations() {
  const res = await fetch(API_BASE, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("خطا در بارگذاری فعال‌سازی‌ها");
  return res.json();
}



// 📌 ارسال درخواست فعال‌سازی (کاربر ID سخت‌افزاری‌اش را ثبت می‌کند)
export async function createActivationRequest(payload: {
  motherboard_code: string;
  cpu_code: string;
  hdd_code: string;
  mac_code: string;
}) {
  const res = await fetch(API_BASE + "/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("خطا در ارسال درخواست فعال‌سازی");
  return res.json();
}

// 📌 فعال کردن برنامه با کد دریافتی
export async function activateCode(
  motherboard_code: string,
  activation_code: string
) {
  const res = await fetch(API_BASE + "/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ motherboard_code, activation_code }),
  });
  if (!res.ok) throw new Error("کد فعال‌سازی معتبر نیست یا خطا رخ داده");
  return res.json();
}

// 📌 گرفتن وضعیت فعال‌سازی (برای AuthGuard یا چک قبل از عملیات مهم)
export async function getActivationStatus(motherboard_code: string) {
  const res = await fetch(`${API_BASE}/status/${motherboard_code}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("خطا در بررسی وضعیت فعال‌سازی");
  return res.json();
}
