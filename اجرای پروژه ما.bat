@echo off
title GJBMS Startup Script
color 0E

echo ========================================
echo   🚀 Starting Gold Jewelry Business MS
echo ========================================

REM 🧩 تنظیم متغیرها

set BACKEND_PATH=C:\Users\DELL\Documents\GitHub\Gold\backend
set FRONTEND_PATH=C:\Users\DELL\Documents\GitHub\Gold\frontend
set FRONTEND_URL=http://localhost:3000/login

REM 🚀 اجرای FastAPI در پنجره جدا
echo ▶ Starting FastAPI backend...
start "FASTAPI SERVER" cmd /k "cd /d %BACKEND_PATH% && echo Running FastAPI... && uvicorn app.main:app --reload"

REM 🚀 اجرای Next.js در پنجره جدا
echo ▶ Starting Next.js frontend...
start "NEXTJS SERVER" cmd /k "cd /d %FRONTEND_PATH% && echo Running Next.js... && npm run dev"

REM ⏳ کمی صبر برای بالا آمدن سرورها
echo ⏳ Waiting for servers to start...
timeout /t 8 >nul

REM 🌐 باز کردن مرورگر روی صفحه لاگین
echo 🌐 Opening login page...
start "" %FRONTEND_URL%

echo ========================================
echo   ✅ Servers started successfully!
echo   🌐 Login page opened in browser.
echo ========================================
pause
exit
