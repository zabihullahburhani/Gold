"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * LoginForm:
 * - inputs داخل یک ظرف با کلاس form-inner قرار دارند تا عرضشان محدود شود (smaller than card)
 * - فرم با Enter ارسال می‌شود (onSubmit)
 * - بعد از لاگین، role در localStorage ذخیره می‌شود و به مسیر مناسب هدایت می‌شود
 */

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const users = {
    admin: { username: "admin", password: "1234", role: "admin" },
    user: { username: "user", password: "1234", role: "user" }
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (username === users.admin.username && password === users.admin.password) {
      localStorage.setItem("gjbms_role", "admin");
      router.push("/admin");
      return;
    }
    if (username === users.user.username && password === users.user.password) {
      localStorage.setItem("gjbms_role", "user");
      router.push("/user");
      return;
    }

    setErr("نام کاربری یا رمز عبور اشتباه است!");
  }

  return (
    <form onSubmit={handleSubmit} className="form-inner" aria-label="login-form">
      <div style={{ textAlign: "center", marginBottom: 6, color: "rgba(212,175,55,0.95)" }}>
        وارد شوید
      </div>

      <input
        className="input"
        placeholder="نام کاربری"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
      />

      <input
        className="input"
        type="password"
        placeholder="رمز عبور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      {err && <div style={{ color: "#ff6b6b", marginBottom: 8, textAlign: "center" }}>{err}</div>}

      <button type="submit" className="btn">ورود</button>
    </form>
  );
}
