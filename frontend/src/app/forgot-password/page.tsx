"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState("request"); // "request", "questions", "reset"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleRequestQuestions(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions);
        setStep("questions");
      } else {
        setMessage(data.detail || "کاربر یافت نشد.");
      }
    } catch (err) {
      setMessage("خطایی در ارتباط با سرور رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswers(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-security-answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, answers }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("reset");
      } else {
        setMessage(data.detail || "پاسخ‌ها نادرست هستند.");
      }
    } catch (err) {
      setMessage("خطایی در ارتباط با سرور رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("رمز عبور با موفقیت تغییر کرد.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.detail || "خطایی رخ داد.");
      }
    } catch (err) {
      setMessage("خطایی در ارتباط با سرور رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {step === "request" ? "بازنشانی رمز عبور" : step === "questions" ? "پاسخ به سوالات امنیتی" : "تغییر رمز عبور"}
        </h2>
        {message && <p className="mb-4 text-center text-black">{message}</p>}

        {step === "request" && (
          <form onSubmit={handleRequestQuestions}>
            <input
              className="w-full mb-3 p-2 border rounded text-black"
              placeholder="نام کاربری"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded"
              disabled={loading}
            >
              {loading ? "در حال بارگذاری..." : "دریافت سوالات"}
            </button>
          </form>
        )}

        {step === "questions" && (
          <form onSubmit={handleSubmitAnswers}>
            {questions.map((question, index) => (
              <div key={index} className="mb-3">
                <label className="block text-black mb-1">{question}</label>
                <input
                  className="w-full p-2 border rounded text-black"
                  value={answers[`question${index + 1}`] || ""}
                  onChange={(e) => setAnswers({ ...answers, [`question${index + 1}`]: e.target.value })}
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded"
              disabled={loading}
            >
              {loading ? "در حال بررسی..." : "تأیید پاسخ‌ها"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword}>
            <input
              className="w-full mb-3 p-2 border rounded text-black"
              type="password"
              placeholder="رمز عبور جدید"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded"
              disabled={loading}
            >
              {loading ? "در حال تغییر..." : "تغییر رمز عبور"}
            </button>
          </form>
        )}

        <button
          className="mt-4 text-blue-500 hover:underline"
          onClick={() => router.push("/login")}
        >
          بازگشت به ورود
        </button>
      </div>
    </div>
  );
}