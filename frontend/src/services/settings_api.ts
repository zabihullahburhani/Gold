const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function saveSettings(settings: any) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}
