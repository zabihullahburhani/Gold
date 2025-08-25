import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6">
      <div className="card text-center" style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: 22, marginBottom: 10 }}>به پنل GJBMS خوش آمدید</h1>
        <p style={{ color: "rgba(212,175,55,0.85)" }}>برای ورود به سیستم از لینک زیر استفاده کنید</p>
        <div style={{ marginTop: 18 }}>
          <Link href="/login" className="btn" role="button">
            برو به صفحه ورود
          </Link>
        </div>
      </div>
    </div>
  );
}
