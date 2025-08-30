const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export interface GoldType {
  gold_type_id?: number;
  type_name: string;
  purity: string;
}

// دریافت لیست
export async function fetchGoldTypes(): Promise<GoldType[]> {
  const res = await fetch(`${API_BASE}/goldtypes`);
  if (!res.ok) throw new Error("Failed to fetch gold types");
  return res.json();
}

// افزودن
export async function createGoldType(gt: GoldType): Promise<GoldType> {
  const res = await fetch(`${API_BASE}/goldtypes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gt),
  });
  if (!res.ok) throw new Error("Failed to create gold type");
  return res.json();
}

// ویرایش
export async function updateGoldType(id: number, gt: GoldType): Promise<GoldType> {
  const res = await fetch(`${API_BASE}/goldtypes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gt),
  });
  if (!res.ok) throw new Error("Failed to update gold type");
  return res.json();
}

// حذف
export async function deleteGoldType(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/goldtypes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete gold type");
}
