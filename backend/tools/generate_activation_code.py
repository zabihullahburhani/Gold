import hashlib
from datetime import datetime

def generate_key_for_hardware(motherboard_code: str, cpu_code: str, hdd_code: str, mac_code: str, secret_key: str) -> str:
    """
    تولید یک کد فعال‌سازی یکتا بر اساس شناسه‌های سخت‌افزاری.
    
    Args:
        motherboard_code: شناسه مادربورد.
        cpu_code: شناسه CPU.
        hdd_code: شناسه HDD.
        mac_code: آدرس MAC.
        secret_key: یک کلید محرمانه که فقط ادمین از آن مطلع است (برای امنیت بیشتر).
        
    Returns:
        کد فعال‌سازی 32 کاراکتری.
    """
    
    # 1. ترکیب تمام شناسه‌ها با یک کلید محرمانه
    raw_string = f"{motherboard_code}{cpu_code}{hdd_code}{mac_code}{secret_key}"
    
    # 2. هش کردن رشته
    hashed_string = hashlib.sha256(raw_string.encode('utf-8')).hexdigest()
    
    # 3. فرمت‌بندی کد فعال‌سازی (اختیاری: برای خوانایی بیشتر)
    # (مثلاً 4 بلوک 8 کاراکتری)
    key_blocks = [hashed_string[i:i+8] for i in range(0, 32, 8)]
    activation_key = "-".join(key_blocks).upper() # تبدیل به حروف بزرگ و جدا کردن با خط تیره
    
    return activation_key

# --- مثال استفاده (شما این را در پنل ادمین اجرا می‌کنید) ---
# فرض کنید اطلاعات زیر را از دیتابیس برای یک مشتری مشخص دریافت کرده‌اید:
customer_mb = "MB-ABC-12345-EFG" 
customer_cpu = "CPU-INTEL-12700K-XYZ"
customer_hdd = "HDD-SN750-NVME-001"
customer_mac = "00:1A:2B:3C:4D:5E"
ADMIN_SECRET = "YOUR_SUPER_SECRET_KEY_FOR_HASHING_2025" # ⚠️ حتماً این کلید را عوض کنید!

final_code = generate_key_for_hardware(
    customer_mb, 
    customer_cpu, 
    customer_hdd, 
    customer_mac, 
    ADMIN_SECRET
)

print(f"کد فعال‌سازی نهایی برای مشتری: {final_code}")
# شما این final_code را به مشتری می‌دهید و مشتری آن را در برنامه خود وارد می‌کند.