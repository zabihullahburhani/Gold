import "./globals.css";
import { ReactNode } from "react";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";


export const metadata = {
  title: "GJBMS",
  description: "Gold and Jewelry Business Management System",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen">
        <header className="header">
          <div className="header-inner">
            <div className="brand">GJBMS</div>
            <Header />
          </div>
        </header>

        <main style={{ minHeight: "calc(100vh - 140px)" }}>
          {children}
        </main>

        <footer style={{ padding: 16 , textAlign: "right", direction: "rtl"}}>
          <Footer />
        </footer>
      </body>
    </html>
  );
}
