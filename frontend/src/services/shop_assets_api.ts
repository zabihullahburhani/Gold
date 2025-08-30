const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function fetchAssets() {
  const res = await fetch(`${API_BASE}/assets`);
  if (!res.ok) throw new Error("Failed to fetch assets");
  return res.json();
}

export async function createAsset(asset: { name: string; value: number }) {
  const res = await fetch(`${API_BASE}/assets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset),
  });
  if (!res.ok) throw new Error("Failed to create asset");
  return res.json();
}

export async function deleteAsset(assetId: number) {
  const res = await fetch(`${API_BASE}/assets/${assetId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete asset");
  return res.json();
}
