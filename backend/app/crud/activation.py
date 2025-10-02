# backend/app/crud/activation_crud.py
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.activation import Activation
from app.schemas.activation import ActivationRequest, ActivationCodeValidation

def create_activation_request(db: Session, request: ActivationRequest):
    existing = db.query(Activation).filter(Activation.motherboard_code == request.motherboard_code).first()
    if existing:
        # اگر قبلا درخواست شده، اطلاعات را برگردان
        return existing
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

def admin_set_code(db: Session, motherboard_code: str, activation_code: str):
    record = db.query(Activation).filter(Activation.motherboard_code == motherboard_code).first()
    if record:
        record.activation_code = activation_code
        db.commit()
        db.refresh(record)
        return record
    return None

def validate_activation_code(db: Session, validation_data: ActivationCodeValidation):
    activation_record = db.query(Activation).filter(Activation.motherboard_code == validation_data.motherboard_code).first()
    if not activation_record:
        return None, "رکورد سخت‌افزار پیدا نشد."

    if activation_record.activation_code != validation_data.activation_code:
        return None, "کد فعال‌سازی اشتباه است."

    # اگر منقضی یا غیر فعال است، فعال کن و 6 ماه بده
    if not activation_record.is_active or (activation_record.expiration_date and activation_record.expiration_date < datetime.utcnow()):
        new_exp = datetime.utcnow() + timedelta(days=180)
        activation_record.is_active = True
        activation_record.expiration_date = new_exp
        db.commit()
        db.refresh(activation_record)
        return activation_record, "فعال‌سازی موفق"
    elif activation_record.is_active and activation_record.expiration_date and activation_record.expiration_date > datetime.utcnow():
        return activation_record, "قبلاً فعال شده و منقضی نشده."
    return None, "خطای نامشخص"

def get_activation_status(db: Session, motherboard_code: str):
    record = db.query(Activation).filter(Activation.motherboard_code == motherboard_code).first()
    if not record:
        return {"is_active": False, "remaining_days": 0, "expiration_date": None}
    if record.is_active and record.expiration_date:
        remaining = record.expiration_date - datetime.utcnow()
        if remaining.total_seconds() > 0:
            return {"is_active": True, "remaining_days": remaining.days, "expiration_date": record.expiration_date}
    return {"is_active": False, "remaining_days": 0, "expiration_date": record.expiration_date}
