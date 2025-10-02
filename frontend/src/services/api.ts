// frontend/src/services/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}

// تابع کمکی برای خواندن JSON از پاسخ، حتی اگر پاسخی نباشد
async function safeJson(res: Response): Promise<any> {
    try {
        return await res.json();
    } catch (e) {
        return { detail: res.statusText || 'No response body' };
    }
}

// Login function
export async function login(username: string, password: string): Promise<{ ok: boolean; data: LoginResponse | { detail: string } }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await safeJson(res);
    if (res.ok && data.access_token) {
        localStorage.setItem("token", data.access_token);
    }
    return { ok: res.ok, data };
  } catch (err: any) {
    return { ok: false, data: { detail: err.message || "Network error" } };
  }
}

// 🎯 تابع اصلاح شده: fetchEmployees
// این تابع خروجی استاندارد { ok, data } را برمی‌گرداند تا کامپوننت Employees بتواند آن را پردازش کند.
export async function fetchEmployees(): Promise<{ ok: boolean; data: any }> {
  const token = localStorage.getItem("token");
  if (!token) {
    return { ok: false, data: { detail: "Authentication token not found." } };
  }

  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const data = await safeJson(res);

    return { ok: res.ok, data };
  } catch (err: any) {
    console.error("fetchEmployees failed:", err);
    return { ok: false, data: { detail: err.message || "Network error during fetch." } };
  }
}

// Create new employee (بدون تغییر)
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
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err: any) {
    return { ok: false, data: { detail: err.message || "Network error" } };
  }
}

// Update employee (بدون تغییر)
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
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err: any) {
    return { ok: false, data: { detail: err.message || "Network error" } };
  }
}

// Delete employee (بدون تغییر)
export async function deleteEmployee(id: number): Promise<{ ok: boolean; data: any }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err: any) {
    return { ok: false, data: { detail: err.message || "Network error" } };
  }
}