const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

// گرفتن آی‌دی سخت‌افزاری و ارسال به سرور
export async function requestActivation() {
  const res = await fetch(`${API_BASE}/activation/request`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to request activation");
  return res.json(); // { hardware_id: "xxxx" }
}

// بررسی کد فعال‌سازی
export async function verifyActivation(code: string) {
  const res = await fetch(`${API_BASE}/activation/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error("Failed to verify activation");
  const data = await res.json();
  return data.success;
}
