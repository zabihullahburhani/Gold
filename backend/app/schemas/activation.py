# backend/app/schemas/activation.py

from pydantic import BaseModel, ConfigDict
from datetime import datetime

# 1. ورودی: ثبت درخواست فعال سازی (توسط کاربر)
class ActivationRequest(BaseModel):
    motherboard_code: str
    cpu_code: str
    hdd_code: str
    mac_code: str

# 2. ورودی: وارد کردن کد فعال سازی (توسط کاربر/ادمین برای فعال سازی)
class ActivationCodeValidation(BaseModel):
    motherboard_code: str
    activation_code: str

# 3. خروجی: نمایش وضعیت کامل (برای پنل ادمین)
class ActivationOut(BaseModel):
    activation_id: int
    motherboard_code: str
    cpu_code: str
    hdd_code: str
    mac_code: str
    activation_code: str | None # کد تولید شده
    is_active: bool
    expiration_date: datetime | None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# 4. خروجی: وضعیت فعال سازی (برای برنامه اصلی مشتری)
class ActivationStatusOut(BaseModel):
    is_active: bool
    remaining_days: int
    expiration_date: datetime | None