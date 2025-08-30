const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_URL = `${API_BASE}/gold_rates`;

export async function fetchGoldRates() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function createGoldRate(data: any) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateGoldRate(id: number, data: any) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteGoldRate(id: number) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
}
