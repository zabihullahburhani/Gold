# backend/app/schemas/customer.py

from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class CustomerBase(BaseModel):
    """
    Schema پایه برای داده‌های مشتری.
    """
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    """
    Schema برای ایجاد یک مشتری جدید.
    """
    pass

class CustomerUpdate(CustomerBase):
    """
    Schema برای به‌روزرسانی اطلاعات مشتری.
    تمامی فیلدها اختیاری هستند.
    """
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerOut(CustomerBase):
    """
    Schema برای نمایش اطلاعات مشتری پس از عملیات CRUD.
    شامل شناسه مشتری و تاریخ ایجاد است.
    """
    customer_id: int
    created_at: datetime
    
    # تنظیمات Pydantic برای مدل‌ها
    model_config = ConfigDict(from_attributes=True)
