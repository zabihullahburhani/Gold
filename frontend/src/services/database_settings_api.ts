const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function saveDBSettings(settings: any) {
  const res = await fetch(`${API_BASE}/db-settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to save DB settings");
  return res.json();
}
