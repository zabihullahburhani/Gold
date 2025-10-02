# backend/app/models/activation.py

from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
# فرض بر این است که Base از فایل core/database وارد می‌شود
from app.core.database import Base 

class Activation(Base):
    __tablename__ = "activations"

    activation_id = Column(Integer, primary_key=True, index=True)
    
    # شناسه های سخت افزار
    motherboard_code = Column(String, nullable=False, unique=True, index=True) 
    cpu_code = Column(String, nullable=False)
    hdd_code = Column(String, nullable=False)
    mac_code = Column(String, nullable=False)
    
    # مدیریت فعال سازی
    activation_code = Column(String, nullable=True) # کدی که شما تولید می کنید
    is_active = Column(Boolean, default=False)
    expiration_date = Column(DateTime, nullable=True) # تاریخ انقضا
    
    created_at = Column(DateTime, server_default=func.now())