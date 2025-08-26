export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">به سیستم مدیریت طلا و پاسه فروشی  غفاری خوش آمدید </h1>
      <a
        href="/login"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
      >
        ورود به سیستم
      </a>
    </main>
  );
}
