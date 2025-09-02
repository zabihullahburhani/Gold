// نویسنده: ذبیح الله برهانی
// آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.
// path: frontend/src/services/transaction_api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_URL = `${API_BASE}/api/v1/transactions`;

export async function createTransaction(token: string, data: any) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error("Failed to create transaction.");
    }
    return res.json();
}

export async function fetchTransactions(token: string) {
    const res = await fetch(API_URL, {
        headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) {
        throw new Error("Failed to fetch transactions.");
    }
    return res.json();
}

export async function updateTransaction(token: string, id: number, data: any) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error("Failed to update transaction.");
    }
    return res.json();
}

export async function deleteTransaction(token: string, id: number) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) {
        throw new Error("Failed to delete transaction.");
    }
    return { success: true, message: "Transaction deleted successfully." };
}
