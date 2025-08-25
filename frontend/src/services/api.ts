import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

export async function fetchCustomers() {
  // نمونه: return await api.get("/customers");
  return []; // stub برای حالا
}

export async function createEmployee(payload: any) {
  // return await api.post("/employees", payload);
  return { ok: true, employee_id: 1 };
}

export default api;
