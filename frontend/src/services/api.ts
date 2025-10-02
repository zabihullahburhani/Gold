// frontend/src/services/api.ts (empl)
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}

// Login function
export async function login(username: string, password: string): Promise<{ ok: boolean; data: LoginResponse | { detail: string } }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) localStorage.setItem("token", data.access_token);
    return { ok: res.ok, data };
  } catch (err: any) {
    return { ok: false, data: { detail: err.message } };
  }
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

  try {
    const formData = new FormData();
    formData.append("full_name", user.full_name);
    formData.append("username", user.username);
    formData.append("password", user.password);
    formData.append("role", user.role);
    if (user.phone) formData.append("phone", user.phone);
    if (user.profile_pic) formData.append("profile_pic", user.profile_pic);

    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err: any) {
    return { ok: false, data: { detail: err.message } };
  }
}
/*
// Fetch list of employees
export async function fetchEmployees(): Promise<{ ok: boolean; data: any[] }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err: any) {
    return { ok: false, data: [] };
  }
}
*/


// Fetch list of employees
export async function fetchEmployees(): Promise<any[]> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to fetch employees");
    return data; // 🔹 حالا مستقیم لیست برمی‌گرداند
  } catch (err: any) {
    console.error("fetchEmployees failed:", err);
    return [];
  }
}




// Update employee
export async function updateEmployee(
  id: number,
  payload: {
    full_name?: string;
    password?: string;
    role?: string;
    phone?: string;
    profile_pic?: File | null;
  }
): Promise<{ ok: boolean; data: any }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    const formData = new FormData();
    if (payload.full_name) formData.append("full_name", payload.full_name);
    if (payload.password) formData.append("password", payload.password);
    if (payload.role) formData.append("role", payload.role);
    if (payload.phone) formData.append("phone", payload.phone);
    if (payload.profile_pic) formData.append("profile_pic", payload.profile_pic);

    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err: any) {
    return { ok: false, data: { detail: err.message } };
  }
}

// Delete employee
export async function deleteEmployee(id: number): Promise<{ ok: boolean; data: any }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err: any) {
    return { ok: false, data: { detail: err.message } };
  }
}

