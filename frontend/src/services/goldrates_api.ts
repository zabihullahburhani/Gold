// frontend/src/services/goldrates_api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = `${API_BASE}/gold-rates`;

// 📌 دریافت لیست نرخ‌ها
export async function fetchGoldRates(token: string) {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch gold rates");
  return res.json();
}

// 📌 ایجاد نرخ جدید
export async function createGoldRate(
  rate: {
    rate_per_gram_usd: number;
    rate_per_gram_afn: number;
    difference_per_gram_usd: number;
    difference_per_gram_afn: number;
  },
  token: string
) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(rate),
  });
  if (!res.ok) throw new Error("Failed to create gold rate");
  return res.json();
}

// 📌 حذف نرخ
export async function deleteGoldRate(id: number, token: string) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete gold rate");
  return true;
}
