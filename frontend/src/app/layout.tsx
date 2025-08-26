// مسیر: frontend/src/app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from 'components/Sidebar';

export const metadata = {
  title: 'GJBMS System',
  description: 'Gold & Shop Management System',
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
        

        <footer style={{ padding: 16 }}>
          <Footer />
        </footer>
      </body>
    </html>
  );
}
