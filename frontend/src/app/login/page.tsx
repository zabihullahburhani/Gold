"use client";
import LoginForm from "../../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <div className="card w-[450px] max-w-2xl">
        <h2 style={{ textAlign: "center", marginBottom: 10, fontSize: 20 }}>ورود به سیستم GJBMS</h2>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 6 }}>

          <LoginForm />
          
        </div>
      </div>
    </div>
  );
}
