import requests
import psutil
import platform
import hashlib
import uuid
import os

# ⚠️ نکته مهم: برای دریافت سریال واقعی مادربورد و هارد در ویندوز نیاز به کتابخانه 'wmi' یا 'subprocess' دارید
# برای سادگی و کارکرد در مثال، از توابع platform/psutil و MAC آدرس استفاده می‌شود.

# 🎯 آدرس API شما
API_URL = "http://localhost:8000/api/v1/activations/request"

def get_unique_hardware_ids():
    """
    جمع آوری شناسه‌های سخت‌افزاری یکتا از سیستم.
    """
    
    # 1. MAC Address (بهترین شناسه)
    try:
        # استفاده از UUID سیستم به عنوان یک شناسه منحصر به فرد (تقریبا شبیه MAC)
        mac_code = ':'.join(['{:02x}'.format((uuid.getnode() >> i) & 0xff) for i in range(0,8*6,8)][::-1])
    except Exception:
        mac_code = "MAC_NOT_FOUND"

    # 2. Motherboard Serial (نیاز به اجرای کد بومی)
    # در ویندوز: wmi.WMI().Win32_BaseBoard()[0].SerialNumber
    # در اینجا از یک شناسه عمومی ویندوز/لینوکس استفاده می‌کنیم.
    try:
        # از شناسه سیستمی پلتفرم استفاده می‌کنیم که اغلب سریال مادربورد است
        motherboard_code = str(platform.node()).upper() + "_" + str(platform.machine()).upper()
    except Exception:
        motherboard_code = "MB_GENERIC_ID"
        
    # 3. CPU ID (تولید یک شناسه یکتا از اطلاعات CPU)
    try:
        cpu_info = platform.processor()
        cpu_code = hashlib.sha256(cpu_info.encode()).hexdigest()[:16].upper()
    except Exception:
        cpu_code = "CPU_GENERIC_ID"
        
    # 4. HDD/SSD Serial (سریال هارد اصلی)
    # این قسمت بسیار پلتفرم محور است و اغلب نیاز به دسترسی ادمین دارد.
    try:
        # استفاده از شناسه UUID دیسک اصلی (در لینوکس) یا یک شناسه عمومی
        disk_uuid = str(uuid.uuid1()).upper()
        hdd_code = f"HDD-{disk_uuid.split('-')[0]}"
    except Exception:
        hdd_code = "HDD_GENERIC_ID"

    return {
        "motherboard_code": motherboard_code,
        "cpu_code": cpu_code,
        "hdd_code": hdd_code,
        "mac_code": mac_code,
    }

def send_activation_request():
    hardware_ids = get_unique_hardware_ids()
    print("--- شناسه‌های جمع‌آوری شده ---")
    print(f"Motherboard ID: {hardware_ids['motherboard_code']}")
    print(f"CPU ID: {hardware_ids['cpu_code']}")
    print(f"HDD ID: {hardware_ids['hdd_code']}")
    print(f"MAC Address: {hardware_ids['mac_code']}")
    print("----------------------------")
    
    try:
        # ارسال درخواست POST به API
        response = requests.post(API_URL, json=hardware_ids)
        response.raise_for_status()  # بررسی خطاهای HTTP
        
        data = response.json()
        
        print("\n✅ درخواست با موفقیت به سرور ارسال و ثبت شد.")
        print(f"شناسه سخت‌افزاری شما برای پشتیبان: {data['motherboard_code']}")
        print("لطفاً این شناسه را به پشتیبانی ارسال کنید تا کد فعال‌سازی نهایی را دریافت کنید.")
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ خطای ارتباط با سرور: {e}")
        print("لطفاً از فعال بودن سرور FastAPI اطمینان حاصل کنید.")
        
    except Exception as e:
        print(f"\n❌ خطای غیرمنتظره: {e}")

if __name__ == "__main__":
    send_activation_request()