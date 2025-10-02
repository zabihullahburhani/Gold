// frontend/src/services/shop_expenses_api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_URL = `${API_BASE}/api/v1/shop-expenses`;

export interface ShopExpensePayload {
  expense_type: string;
  amount: number;
  expense_date?: string; // ISO datetime optional
  description?: string;
  employee_id?: number | null;
}

export async function fetchExpenses(token: string) {
  const res = await fetch(`${API_URL}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch shop expenses");
  return res.json();
}

export async function createExpense(token: string, data: ShopExpensePayload) {
  const res = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to create expense: ${err}`);
  }
  return res.json();
}

export async function updateExpense(token: string, id: number, data: Partial<ShopExpensePayload>) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to update expense: ${err}`);
  }
  return res.json();
}

export async function deleteExpense(token: string, id: number) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to delete expense: ${err}`);
  }
  return { success: true };
}
