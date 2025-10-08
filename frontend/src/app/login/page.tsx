"use client";
"use client";
import { useState } from "react";
import { login } from "../../services/api";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("1234");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(username.trim(), password);
      if (res.ok) {
        localStorage.setItem("token", res.data.access_token);
        const role = res.data.role;
        alert("ورود موفق");
        if (role === "admin") window.location.href = "/admin";
        else window.location.href = "/user";
      } else {
        alert(res.data?.detail || "خطایی در ورود رخ داد.");
      }
    } catch (err) {
      alert("خطایی رخ داد. لطفاً سرور را بررسی کنید: 8000");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl w-full max-w-md text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">ورود به GJBMS</h2>

        <input
          className="w-full mb-3 p-2 border rounded text-white"
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="w-full mb-4 p-2 border rounded text-white"
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded"
          disabled={loading}
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>

        <Link href="/forgot-password" className="mt-4 text-blue-500 hover:underline block text-center">
          رمز عبور خود را فراموش کرده‌اید؟
        </Link>
      </form>
    </div>
  );
}


// created by: professor zabihullah burhani
// ICT and AI and Robotics متخصص
// phone: 0705002913, email: zabihullahburhani@gmail.com
// Address: Takhar University, COmputer science faculty.
