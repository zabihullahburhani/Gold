const API_URL = "http://localhost:8000";

export async function fetchDebts() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function createDebt(data: {
  customer_id: number;
  employee_id: number;
  amount_usd: number;
  description: string;
}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateDebt(id: number, data: any) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteDebt(id: number) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
}
