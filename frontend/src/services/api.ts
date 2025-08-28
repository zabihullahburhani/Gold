// frontend/src/services/api.ts
// API functions for authentication and employee management.
// Backend paths: /api/v1/auth for login, /api/v1/employees for CRUD.
// Created by: Professor Zabihullah Burhani

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}

// Login function
export async function login(username: string, password: string): Promise<{ ok: boolean; data: LoginResponse | { detail: string } }> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("token", data.access_token); // Store token for future requests
  }
  return { ok: res.ok, data };
}

// Create new employee with optional profile picture
export async function createEmployee(user: {
  full_name: string;
  username: string;
  password: string;
  role: string;
  phone?: string;
  profile_pic?: File | null;
}): Promise<{ ok: boolean; data: any }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const formData = new FormData();
  formData.append("full_name", user.full_name);
  formData.append("username", user.username);
  formData.append("password", user.password);
  formData.append("role", user.role);
  if (user.phone) formData.append("phone", user.phone);
  if (user.profile_pic) formData.append("profile_pic", user.profile_pic);

  const res = await fetch(`${API_BASE}/api/v1/users`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

// Fetch list of employees
export async function fetchEmployees(): Promise<{ ok: boolean; data: any[] }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_BASE}/api/v1/users`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

// Update employee
export async function updateEmployee(
  id: number,
  payload: {
    full_name?: string;
    username?: string;
    password?: string;
    role?: string;
    phone?: string;
    profile_pic?: File | null;
  }
): Promise<{ ok: boolean; data: any }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const formData = new FormData();
  if (payload.full_name) formData.append("full_name", payload.full_name);
  if (payload.username) formData.append("username", payload.username);
  if (payload.password) formData.append("password", payload.password);
  if (payload.role) formData.append("role", payload.role);
  if (payload.phone) formData.append("phone", payload.phone);
  if (payload.profile_pic !== undefined) formData.append("profile_pic", payload.profile_pic as any);

  const res = await fetch(`${API_BASE}/api/v1/users/${id}`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

// Delete employee
export async function deleteEmployee(id: number): Promise<{ ok: boolean; data: any }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_BASE}/api/v1/users/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  const data = await res.json();
  return { ok: res.ok, data };
}
