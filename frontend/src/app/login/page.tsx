"use client";
import { useState } from "react";
import { login } from "../../services/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try{
      const res = await login(username.trim(), password);
      if (res.ok){
        localStorage.setItem("token", res.data.access_token);
        //localStorage.setItem("role", res.data.role);
        
        const role = res.data.role;
        alert("✅ ورود موفق");
        if (role ==="admin") window.location.href="/admin";
        else window.location.href="/user";
      
      }else {alert(res.data?.detail || "نام کاربری یا رمز اشتباه است");}

    } catch (err){
      alert("اتصال برقرار نشد. مطمئن شوید بک‌اند روی :8000 اجرا است.");
    }finally {
      setLoading(false);
    }
   
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl w-full max-w-md text-black shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">ورود به GJBMS</h2>

        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="w-full mb-4 p-2 border rounded"
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
      </form>
    </div>
  );
}

// created by: professor zabihullah burhani
// ICT and AI and Robotics متخصص
// phone: 0705002913, email: zabihullahburhani@gmail.com
// Address: Takhar University, COmputer science faculty.
