// نویسنده: ذبیح الله برهانی
// آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.
// path: frontend/src/services/transaction_api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_URL = `${API_BASE}/api/v1/transactions`;

// ⚠️ توجه: gold_type_id حذف شد و فیلدهای جدید اضافه شدند

export interface TransactionPayload {
  customer_id: number;
  // gold_type_id: number; // حذف شد
  
  type: "buy" | "sell";
  
  // فیلدهای ورودی جدید که باید ثبت شوند
  weight: number;         // وزن (گرام)
  source_carat: number;   // عیار مبدا
  gold_rate: number;      // نرخ توله
  gold_amount: number;    // مقدار طلا (عیار 23.88) - نتیجه محاسبه
  
  // مقادیر محاسباتی که معمولاً در بک‌اند محاسبه و ذخیره می‌شوند اما اینجا نیز برای سازگاری در Payload قرار داده شدند
  dollar_balance: number; // دلار بالانس
  gold_balance: number;   // طلای بالانس
  
  dollar_in: number;
  dollar_out: number;
  gold_in: number;
  gold_out: number;
  
  detail?: string;
  date: string;
}

export interface TransactionResponse extends TransactionPayload {
  txn_id: number;
  created_at: string;
}

// ----------------------------------------------------------------------
// توابع API
// ----------------------------------------------------------------------

// گرفتن تراکنش‌ها
export async function fetchTransactions(token: string, customer_id?: number): Promise<TransactionResponse[]> {
  const url = customer_id ? `${API_URL}?search=${customer_id}` : API_URL;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

// ایجاد تراکنش
export async function createTransaction(token: string, data: TransactionPayload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create transaction");
  return res.json();
}

// بروزرسانی
export async function updateTransaction(token: string, id: number, data: TransactionPayload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update transaction");
  return res.json();
}

// حذف
export async function deleteTransaction(token: string, id: number) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete transaction");
  return { success: true };
}