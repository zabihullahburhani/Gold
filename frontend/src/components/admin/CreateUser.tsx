// frontend/src/components/admin/CreateUser.tsx
// Form for creating or editing employees.
// Integrated with updated API functions and added simple validation.
// Created by: Professor Zabihullah Burhani
// ICT and AI and Robotics Specialist
// Phone: 0705002913, Email: zabihullahburhani@gmail.com
// Address: Takhar University, Computer Science Faculty.

"use client";

import { useState } from "react";
import { createEmployee, updateEmployee } from "../../services/api";

interface Props {
  onSuccess?: () => void;
  employee?: {
    employee_id: number;
    full_name: string;
    username: string;
    role: string;
    phone?: string;
    profile_pic?: string;
  };
  onCancel?: () => void;
}

export default function CreateUser({ onSuccess, employee, onCancel }: Props) {
  const [full_name, setFullName] = useState(employee?.full_name || "");
  const [username, setUsername] = useState(employee?.username || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(employee?.role || "user");
  const [phone, setPhone] = useState(employee?.phone || "");
  const [profile_pic, setProfilePic] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null); // Added for validation

  const validateForm = () => {
    if (!full_name || !username || (!employee && !password)) {
      setError("نام کامل، نام کاربری و رمز عبور الزامی است.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let res;
      if (employee) {
        // Edit mode
        res = await updateEmployee(employee.employee_id, {
          full_name,
         // username,
          password: password || undefined, // Optional password change
          role,
          phone,
          profile_pic,
        });
      } else {
        // Create mode
        res = await createEmployee({
          full_name,
          username,
          password,
          role,
          phone,
          profile_pic,
        });
      }

      if (res.ok) {
        alert(employee ? "✅ کارمند ویرایش شد!" : "✅ کارمند جدید ساخته شد!");
        setFullName(""); setUsername(""); setPassword(""); setPhone(""); setProfilePic(null);
        if (onSuccess) onSuccess();
      } else {
        alert(res.data.detail || "❌ خطا در عملیات");
      }
    } catch (error) {
      alert("❌ خطا در عملیات");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-white mb-4">
      <h2 className="text-lg font-bold mb-4">
        {employee ? "✏️ ویرایش کارمند" : "➕ ایجاد کارمند جدید"}
      </h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <input
        type="text"
        placeholder="نام کامل"
        value={full_name}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full mb-2 px-3 py-2 border rounded"
      />
      <input
        type="text"
        placeholder="نام کاربری"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full mb-2 px-3 py-2 border rounded"
        disabled={!!employee} // Disable username edit
      />
      <input
        type="password"
        placeholder={employee ? "رمز عبور (اختیاری)" : "رمز عبور"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-2 px-3 py-2 border rounded"
      />
      <input
        type="text"
        placeholder="شماره تماس"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full mb-2 px-3 py-2 border rounded"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full mb-2 px-3 py-2 border rounded"
      >
        <option value="user">کارمند</option>
        <option value="admin">ادمین</option>
      </select>
      <input
        type="file"
        onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
        className="mb-3"
      />

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded"
        >
          {employee ? "ویرایش کارمند" : "ثبت کارمند"}
        </button>
        {employee && onCancel && (
          <button
            onClick={onCancel}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded"
          >
            ❌ لغو
          </button>
        )}
      </div>
    </div>
  );
}