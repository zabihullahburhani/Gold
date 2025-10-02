import "./globals.css";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { dir } from "console";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa"  dir="rtl">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="p-2 sm:p-4 md:p-6 flex-1">{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
