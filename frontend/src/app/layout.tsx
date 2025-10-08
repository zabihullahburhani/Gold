import "./globals.css";
import { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Script from "next/script";

export const metadata = {
  title: "GJBMS",
  description: "سیستم مدیریت تجارت پاسه و طلا فروشی",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* نسخه آفلاین Tailwind از پوشه public/offline */}
        <Script src="/offline/tailwind.min.js" strategy="beforeInteractive" />
      </head>

      <body className="min-h-screen bg-gray-100 font-inter">
        <header className="bg-white shadow-md">
          <div className="header-inner max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="brand">
              <a href="/admin" className="text-2xl font-bold text-teal-600">
                GJBMS
              </a>
            </div>
            <Header />
          </div>
        </header>

        <div className="flex max-w-7xl mx-auto gap-4">
          <main
            className="flex-1 p-4"
            style={{ minHeight: "calc(100vh - 140px)" }}
          >
            {children}
          </main>
        </div>

        <footer className="bg-white shadow-md mt-4">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Footer />
          </div>
        </footer>
      </body>
    </html>
  );
}
