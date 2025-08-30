const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_URL = `${API_BASE}/gold_types`;

export async function fetchGoldTypes() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function createGoldType(data: any) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateGoldType(id: number, data: any) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteGoldType(id: number) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
}
