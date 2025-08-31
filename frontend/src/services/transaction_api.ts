// نویسنده: ذبیح الله برهانی
// آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

// تعریف URL پایه API به صورت مستقیم برای جلوگیری از خطای "Module not found".
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_URL = `${API_BASE}/api/v1/transactions`;

export async function createTransaction(token: string, transaction: any) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(transaction),
    });
    if (!res.ok) {
        throw new Error("Failed to create transaction.");
    }
    return res.json();
}

export async function fetchTransactions(token: string) {
    const res = await fetch(API_URL, {
        headers: {
            "Authorization": `Bearer ${token}`
        },
    });
    if (!res.ok) {
        throw new Error("Failed to fetch transactions.");
    }
    return res.json();
}
