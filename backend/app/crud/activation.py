# backend/app/crud/activation.py

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.activation import Activation
from app.schemas.activation import ActivationRequest, ActivationCodeValidation

# 📌 1. ثبت درخواست سخت افزار
def create_activation_request(db: Session, request: ActivationRequest):
    existing_activation = db.query(Activation).filter(
        Activation.motherboard_code == request.motherboard_code
    ).first()
    
    if existing_activation:
        return existing_activation

    db_activation = Activation(
        motherboard_code=request.motherboard_code,
        cpu_code=request.cpu_code,
        hdd_code=request.hdd_code,
        mac_code=request.mac_code,
        is_active=False
    )
    db.add(db_activation)
    db.commit()
    db.refresh(db_activation)
    return db_activation

# 📌 2. اعتبار سنجی کد و فعال سازی (برای 6 ماه)
def validate_activation_code(db: Session, validation_data: ActivationCodeValidation):
    activation_record = db.query(Activation).filter(
        Activation.motherboard_code == validation_data.motherboard_code
    ).first()

    if not activation_record:
        return None, "رکورد سخت افزار شما پیدا نشد."
    
    # 🎯 چک کردن کد فعال سازی (اگر توسط ادمین ست نشده باشد، کد شما را نمی‌پذیرد)
    if activation_record.activation_code is None or activation_record.activation_code != validation_data.activation_code:
        return None, "کد فعال‌سازی اشتباه است یا توسط ادمین تایید نشده."
    
    # فعال سازی و تعیین تاریخ انقضا
    
    # 🎯 اگر فعال نیست یا منقضی شده، مجدداً فعال شود
    is_expired = activation_record.expiration_date and activation_record.expiration_date < datetime.now()
    
    if not activation_record.is_active or is_expired:
        
        # تعیین تاریخ انقضای جدید: 6 ماه بعد از امروز (180 روز)
        new_expiration_date = datetime.now() + timedelta(days=6 * 30) 
        
        activation_record.is_active = True
        activation_record.expiration_date = new_expiration_date
        db.commit()
        db.refresh(activation_record)
        return activation_record, "فعال‌سازی با موفقیت انجام شد و تاریخ انقضا تنظیم گردید."
    
    # اگر قبلاً فعال و دارای اعتبار است
    return activation_record, "برنامه قبلاً فعال شده و هنوز منقضی نشده."

# 📌 3. چک کردن وضعیت فعال سازی (مهم ترین بخش برای جلوگیری از استفاده غیرمجاز)
def get_activation_status(db: Session, motherboard_code: str):
    activation_record = db.query(Activation).filter(
        Activation.motherboard_code == motherboard_code
    ).first()

    if not activation_record or not activation_record.is_active or not activation_record.expiration_date:
        return {"is_active": False, "remaining_days": 0, "expiration_date": None}

    remaining_time = activation_record.expiration_date - datetime.now()
    
    if remaining_time.total_seconds() > 0:
        remaining_days = remaining_time.days
        return {
            "is_active": True, 
            "remaining_days": remaining_days, 
            "expiration_date": activation_record.expiration_date
        }
    
    # منقضی شده است
    return {"is_active": False, "remaining_days": 0, "expiration_date": activation_record.expiration_date}