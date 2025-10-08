export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-yellow-400">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-center leading-relaxed">
        به سیستم مدیریت طلا و پاسه فروشی <br /> غفاری خوش آمدید ✨
      </h1> 
      <button><a
        href="/login"
        className="px-8 py-3 rounded-xl shadow-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-all duration-300"
      >
        ورود به سیستم
      </a> </button>
      
    </main>
  );
}
