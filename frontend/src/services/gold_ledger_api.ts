// frontend/src/services/gold_ledger_api.ts

/**
 * 🔗 تنظیمات API
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_URL = `${API_BASE}/api/v1/gold_ledger`;

/**
 * 📤 واسط داده ورودی (Payload) برای ایجاد/به‌روزرسانی
 */
export interface GoldLedgerPayload {
    customer_id: number;
    capital_id?: number;
    description: string;
    received: number;
    paid: number;
    heel_purity_carat?: number;
    // 💡 نکته: این فیلد در فرم شما همیشه تنظیم می‌شود، پس آن را اجباری می‌کنیم.
    transaction_date: string; 
}

/**
 * 📥 واسط داده خروجی (Response) از سرور
 */
export interface GoldLedgerResponse {
    gold_ledger_id: number;
    customer_id: number;
    capital_id?: number;
    transaction_date: string;
    description: string;
    received: number;
    paid: number;
    heel_purity_carat?: number;
    balance: number;
}

/**
 * 📑 واکشی لیست تراکنش‌های طلا
 */
export async function fetchGoldLedgers(
    token: string | null, 
    params?: {
        customer_id?: number;
        start_date?: string;
        end_date?: string;
        page?: number;
        limit?: number;
    }
): Promise<GoldLedgerResponse[]> {
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
        throw new Error(`Failed to fetch gold ledgers: ${response.status} - ${errorText}`);
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
 * ✨ ایجاد یک تراکنش جدید طلا
 */
export async function createGoldLedger(
    token: string | null, 
    data: GoldLedgerPayload
): Promise<GoldLedgerResponse> {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        // 💡 تضمین می‌کند که داده‌های عددی صفر (مثل عیار پاشنه) به Payload اضافه نمی‌شوند
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ detail: 'Unknown error' }));
        // 💡 در صورت خطا، جزئیات خطای بک‌اند را برای نمایش دقیق‌تر استخراج می‌کند.
        throw new Error(`Failed to create gold ledger: ${response.status} - ${errorDetail.detail || errorDetail.error || 'Unknown error'}`);
    }

    return await response.json();
}

/**
 * ✍️ به‌روزرسانی یک تراکنش موجود طلا
 */
export async function updateGoldLedger(
    token: string | null, 
    gold_ledger_id: number, 
    data: Partial<GoldLedgerPayload>
): Promise<GoldLedgerResponse> {
    const response = await fetch(`${API_URL}/${gold_ledger_id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Failed to update gold ledger: ${response.status} - ${errorDetail.detail || errorDetail.error || 'Unknown error'}`);
    }

    return await response.json();
}

/**
 * 🗑️ حذف یک تراکنش طلا
 */
export async function deleteGoldLedger(
    token: string | null, 
    gold_ledger_id: number
): Promise<void> {
    const response = await fetch(`${API_URL}/${gold_ledger_id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        },
    });
    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Failed to delete gold ledger: ${response.status} - ${errorDetail.detail || errorDetail.error || 'Unknown error'}`);
    }
}

/**
 * 🔍 دریافت یک تراکنش خاص
 */
export async function getGoldLedger(
    token: string | null, 
    gold_ledger_id: number
): Promise<GoldLedgerResponse> {
    const response = await fetch(`${API_URL}/${gold_ledger_id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });
    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Failed to get gold ledger: ${response.status} - ${errorDetail.detail || errorDetail.error || 'Unknown error'}`);
    }

    return await response.json();
}