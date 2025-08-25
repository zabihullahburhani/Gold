"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // کامبوباکس برای انتخاب نقش
  const [err, setErr] = useState<string | null>(null);

  const users = {
    admin: { username: "admin", password: "1234", role: "admin" },
    user: { username: "user", password: "1234", role: "user" },
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (
      (role === "admin" &&
        username === users.admin.username &&
        password === users.admin.password) ||
      (role === "user" &&
        username === users.user.username &&
        password === users.user.password)
    ) {
      localStorage.setItem("gjbms_role", role);
      router.push(role === "admin" ? "/admin" : "/user");
      return;
    }

    setErr("نام کاربری یا رمز عبور اشتباه است!");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="form-inner flex flex-col items-center gap-2.5" // gap-2.5 ≈ 10px
      style={{ maxWidth: "300px", width: "100%" }}
      aria-label="login-form"
    >
    

      <input
        className="input  px-3 py-2 w-full rounded bg-gray-900 text-yellow-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        placeholder="نام کاربری"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        style={{ height: "40px",  marginBottom: "10px" }}
      />

      <input
        className="input   px-3 py-2 w-full rounded bg-gray-900 text-yellow-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        type="password"
        placeholder="رمز عبور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        style={{ height: "40px",  marginBottom: "10px" }}
      />

      <select
        className="  border rounded px-3 py-2 w-full bg-gray-900 text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        style={{ height: "40px",  marginBottom: "10px" }}
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="user">یوزر عادی</option>
        <option value="admin">ادمین</option>
      </select>

      {err && <div style={{ color: "#ff6b6b", marginBottom: 8, textAlign: "center" }}>{err}</div>}

      <button
        type="submit"
        className="btn w-full rounded bg-yellow-400 text-gray-900 font-bold py-2 hover:bg-yellow-500 transition-colors"
        style={{ height: "40px" }}
      >
        ورود
      </button>
    </form>
  );
}
