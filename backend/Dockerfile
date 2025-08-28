# استفاده از پایتون به عنوان بیس ایمیج
FROM python:3.11-slim

# ست کردن دایرکتوری کاری
WORKDIR /app

# کپی کردن فایل‌های requirements
COPY requirements.txt .

# نصب پکیج‌ها
RUN pip install --no-cache-dir -r requirements.txt

# کپی کردن کد پروژه
COPY . .

# پورت پیش‌فرض فست‌API
EXPOSE 8000

# اجرای FastAPI با uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
