@echo off
title GJBMS Auto Startup
color 0E

echo ========================================
echo   🚀 Starting Gold Jewelry Business MS
echo ========================================

REM مسیرها را مطابق با سیستم خودت تغییر بده
set BACKEND_PATH=C:\Users\DELL\Documents\GitHub\Gold\backend
set FRONTEND_PATH=C:\Users\DELL\Documents\GitHub\Gold\frontend
set BACKEND_PORT=8000
set FRONTEND_PORT=3000
set LOGIN_URL=http://localhost:%FRONTEND_PORT%/login

REM --- اجرای بک‌اند با مانیتورینگ ---
:backend
echo ▶ Starting Backend...
start "" /min cmd /c "cd /d %BACKEND_PATH% && uvicorn app.main:app --host localhost --port %BACKEND_PORT%"
timeout /t 5 >nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%BACKEND_PORT%"') do set BACK_PID=%%a

REM --- اجرای فرانت‌اند با مانیتورینگ ---
:frontend
echo ▶ Starting Frontend...
start "" /min cmd /c "cd /d %FRONTEND_PATH% && npm run dev"
timeout /t 10 >nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%FRONTEND_PORT%"') do set FRONT_PID=%%a

REM --- باز کردن مرورگر ---
start "" "%LOGIN_URL%"
echo 💡 Servers running! Close the browser to stop everything.

REM --- مانیتور بستن مرورگر ---
:monitor
tasklist /fi "imagename eq chrome.exe" | find /i "chrome.exe" >nul
if %errorlevel%==0 (
    timeout /t 5 >nul
    goto monitor
)

echo 🔴 Browser closed, shutting down servers...

REM --- توقف سرورها ---
if defined BACK_PID taskkill /PID %BACK_PID% /F >nul 2>&1
if defined FRONT_PID taskkill /PID %FRONT_PID% /F >nul 2>&1

echo ✅ All servers stopped.
exit
