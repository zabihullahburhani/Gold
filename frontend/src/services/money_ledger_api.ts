/**
 * 🔗 تنظیمات API
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_URL = `${API_BASE}/api/v1/money_ledger`;

/**
 * 📤 واسط داده ورودی (Payload) برای ایجاد/به‌روزرسانی
 */
export interface MoneyLedgerPayload {
    customer_id: number;
    capital_id?: number;
    description: string;
    received: number;
    paid: number;
    // 💡 نکته: این فیلد در فرم شما همیشه تنظیم می‌شود، پس آن را اجباری می‌کنیم.
    transaction_date: string; 
}

/**
 * 📥 واسط داده خروجی (Response) از سرور
 */
export interface MoneyLedgerResponse {
    money_ledger_id: number;
    customer_id: number;
    capital_id?: number;
    transaction_date: string;
    description: string;
    received: number;
    paid: number;
    usd_balance: number;
}

/**
 * 📑 واکشی لیست تراکنش‌های دالر
 */
export async function fetchMoneyLedgers(
    token: string | null, 
    params?: {
        customer_id?: number;
        start_date?: string;
        end_date?: string;
        page?: number;
        limit?: number;
    }
): Promise<MoneyLedgerResponse[]> {
    const queryParams = new URLSearchParams();
    if (params?.customer_id) queryParams.append('customer_id', params.customer_id.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    const url = queryString ? `${API_URL}/?${queryString}` : API_URL;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch money ledgers: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    if (Array.isArray(result)) {
        return result;
    } else if (result && Array.isArray(result.data)) {
        return result.data;
    } else {
        console.warn("ساختار غیرمنتظره پاسخ:", result);
        return [];
    }
}

/**
 * ✨ ایجاد یک تراکنش جدید دالر
 */
export async function createMoneyLedger(
    token: string | null, 
    data: MoneyLedgerPayload
): Promise<MoneyLedgerResponse> {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Failed to create money ledger: ${response.status} - ${errorDetail.detail || errorDetail.error || 'Unknown error'}`);
    }

    return await response.json();
}

/**
 * ✍️ به‌روزرسانی یک تراکنش موجود دالر
 */
export async function updateMoneyLedger(
    token: string | null, 
    money_ledger_id: number, 
    data: Partial<MoneyLedgerPayload>
): Promise<MoneyLedgerResponse> {
    const response = await fetch(`${API_URL}/${money_ledger_id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Failed to update money ledger: ${response.status} - ${errorDetail.detail || errorDetail.error || 'Unknown error'}`);
    }

    return await response.json();
}

/**
 * 🗑️ حذف یک تراکنش دالر
 */
export async function deleteMoneyLedger(
    token: string | null, 
    money_ledger_id: number
): Promise<void> {
    const response = await fetch(`${API_URL}/${money_ledger_id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        },
    });
    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Failed to delete money ledger: ${response.status} - ${errorDetail.detail || errorDetail.error || 'Unknown error'}`);
    }
}

/**
 * 🔍 دریافت یک تراکنش خاص
 */
export async function getMoneyLedger(
    token: string | null, 
    money_ledger_id: number
): Promise<MoneyLedgerResponse> {
    const response = await fetch(`${API_URL}/${money_ledger_id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });
    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Failed to get money ledger: ${response.status} - ${errorDetail.detail || errorDetail.error || 'Unknown error'}`);
    }

    return await response.json();
}