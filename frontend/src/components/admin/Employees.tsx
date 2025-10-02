// frontend/src/components/admin/Employees.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import CreateUser from "./CreateUser";
import { Card, CardHeader, CardContent } from "./ui/card"; // فرض بر این است که مسیر درست است
import {
  fetchEmployees as apiFetchEmployees,
  deleteEmployee as apiDeleteEmployee,
} from "../../services/api"; // استفاده از فایل اصلاح شده

interface Employee {
  employee_id: number | null;
  full_name: string;
  role: string;
  phone?: string;
  username?: string;
  profile_pic?: string | null;
}

// تابع کمکی برای نرمال‌سازی ورودی
function normalizeEmployee(raw: any): Employee {
  return {
    employee_id:
      raw.employee_id ?? raw.id ?? raw.employeeId ?? raw.user_id ?? null,
    full_name: raw.full_name ?? raw.name ?? raw.fullName ?? "",
    role: raw.role ?? raw.position ?? raw.title ?? "",
    phone: raw.phone ?? raw.mobile ?? raw.telephone ?? "",
    username: raw.username ?? raw.user ?? raw.login ?? "",
    profile_pic:
      raw.profile_pic ??
      raw.avatar ??
      raw.profile_pic_url ??
      raw.picture ??
      null,
  };
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // خواندن لیست کارمندان از API
  const fetchEmployeesList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // res اکنون حتماً ساختار { ok, data } دارد
      const res = await apiFetchEmployees();
      console.log("DEBUG fetchEmployees response:", res); 

      if (res.ok) {
        let arr: any[] = [];

        // 🎯 منطق استخراج آرایه برای پشتیبانی از کامبوباکس و لیست اصلی
        if (Array.isArray(res.data)) {
          // حالت ۱: اگر res.data خودش آرایه باشد (مانند پاسخ مستقیم بک‌اند)
          arr = res.data;
        } else if (res.data && typeof res.data === 'object') {
          // حالت ۲: اگر res.data یک شیء باشد (مانند پاسخ صفحه‌بندی شده { users: [...] })
          // 'users' را به دلیل استفاده از endpoint '/users' در API اولویت می‌دهیم.
          const potentialArray = res.data.users || res.data.employees || res.data.items || res.data.data;
          
          if (Array.isArray(potentialArray)) {
            arr = potentialArray;
          }
        }
        
        console.log("DEBUG Extracted Array Length:", arr.length);

        const normalized = arr
            .map((r: any) => normalizeEmployee(r))
            // بهتر است آیتم‌هایی که ID ندارند را فیلتر کنیم
            .filter(e => e.employee_id !== null || e.username !== ""); 
            
        setEmployees(normalized);
      } else {
        // 🎯 مدیریت خطا بر اساس data.detail از فایل API
        // این بخش مشکل خطای status: نامشخص را حل می‌کند
        const detailError = res.data?.detail || "خطای نامشخص در دریافت داده";
        setError(`خطا: ${detailError} (Code: ${res.data?.status || 'N/A'})`); 
        setEmployees([]);
      }
    } catch (err: any) {
      console.error("fetchEmployeesList catch error:", err);
      setError(err?.message || "خطای نامشخص در دریافت کارمندان");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // اجرای اولیه
  useEffect(() => {
    fetchEmployeesList();
  }, [fetchEmployeesList]);

  const handleDelete = async (id: number | null) => {
    if (id === null) return alert("ID نامعتبر برای حذف");
    if (!confirm("آیا مطمئن هستید می‌خواهید حذف کنید؟")) return;
    try {
      const res = await apiDeleteEmployee(id);
      if (res.ok) {
        // حذف از لیست محلی
        setEmployees((prev) => prev.filter((e) => e.employee_id !== id));
      } else {
        const delError = res.data?.detail || res.data?.error || "";
        alert("❌ خطا در حذف کارمند: " + (delError || ""));
      }
    } catch (err: any) {
      console.error("deleteEmployee error:", err);
      alert("❌ خطای شبکه هنگام حذف کارمند");
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowCreate(true);
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setShowCreate(false);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">👨‍💼 مدیریت کارمندان</h1>

      <div>
        <button
          onClick={() => {
            setShowCreate((s) => !s);
            setEditingEmployee(null);
          }}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {showCreate ? "❌ بستن فرم" : "➕ افزودن کارمند"}
        </button>

        {/* اگر فرم ایجاد/ویرایش نمایش داده شود */}
        {showCreate && (
          <CreateUser
            employee={editingEmployee || undefined}
            onSuccess={() => {
              setShowCreate(false);
              setEditingEmployee(null);
              fetchEmployeesList(); // بازخوانی لیست بعد از اضافه/ویرایش
            }}
            onCancel={editingEmployee ? handleCancelEdit : undefined}
          />
        )}
      </div>

      {/* نمایش خطا */}
      {error && (
        <div className="text-red-400 bg-red-100/5 p-3 rounded">
          {error}
        </div>
      )}

      {/* نمایش وضعیت بارگیری */}
      {loading ? (
        <p>در حال بارگیری...</p>
      ) : employees.length === 0 ? (
        <div className="p-4 bg-gray-800 text-yellow-300 rounded">
          هیچ کارمندی یافت نشد.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            // استفاده از ID معتبر یا username به عنوان key
            <Card key={emp.employee_id || emp.username}> 
              <CardHeader>{emp.full_name || "بدون نام"}</CardHeader>
              <CardContent>
                {emp.profile_pic && (
                  <img
                    src={emp.profile_pic}
                    alt="Profile"
                    className="w-16 h-16 rounded-full mb-2"
                  />
                )}
                <p>نام کاربری: {emp.username || "-"}</p>
                <p>سمت: {emp.role || "-"}</p>
                <p>تلفن: {emp.phone || "نامشخص"}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(emp)}
                    className="px-3 py-1 rounded-lg bg-blue-500 text-white"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleDelete(emp.employee_id)}
                    className="px-3 py-1 rounded-lg bg-red-500 text-white"
                  >
                    حذف
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}