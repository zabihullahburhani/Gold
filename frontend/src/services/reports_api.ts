// frontend/src/services/reports_api.ts
// API functions for fetching reports
// Created by: Professor Zabihullah Burhani
// ICT and AI and Robotics Specialist
// Phone: 0705002913, Email: zabihullahburhani@gmail.com
// Address: Takhar University, Computer Science Faculty.

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Report {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

// Fetch all reports from backend
export async function fetchReports(): Promise<{ ok: boolean; data: Report[] }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_BASE}/reports`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  return { ok: res.ok, data };
}
