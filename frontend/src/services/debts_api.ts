// path: frontend/src/services/debts_api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_URL = `${API_BASE}/api/v1/debts`;

interface Debt {
    debt_id: number;
    customer_id: number;
    employee_id: number;
    gold_grams: number;
    tola: number;
    usd: number;
    afn: number;
    notes?: string;
    is_paid: boolean;
    created_at: string;
}

export async function fetchDebts(token: string, search: string = ''): Promise<Debt[]> {
    const url = search ? `${API_URL}?search=${encodeURIComponent(search)}` : API_URL;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch debts");
    return res.json();
}

export async function createDebt(data: any, token: string) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create debt");
    return res.json();
}

export async function updateDebt(id: number, data: any, token: string) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update debt");
    return res.json();
}

export async function deleteDebt(id: number, token: string) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete debt");
}