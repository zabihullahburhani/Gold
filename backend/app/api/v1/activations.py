# backend/app/api/v1/activations.py
# ⚠️ مطمئن شوید که سایر فایل‌های مدل و CRUD شما مطابق با بخش‌های ۱.۱، ۱.۲ و ۱.۳ هستند.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List 
from app.core.database import get_db # 🎯 فرض بر وجود این تابع
from app.schemas.activation import ActivationRequest, ActivationOut, ActivationCodeValidation, ActivationStatusOut # 🎯 فرض بر وجود این اسکیماها
from app.crud import activation as crud # 🎯 فرض بر وجود این منطق CRUD
from app.models.activation import Activation # 🎯 فرض بر وجود این مدل

router = APIRouter(prefix="/activations", tags=["activations"])

# 1. لیست تمام فعال‌سازی‌ها (برای پنل ادمین)
@router.get("/", response_model=List[ActivationOut])
def list_activations(db: Session = Depends(get_db)):
    """دریافت لیست کامل تمام رکوردهای فعال سازی برای پنل ادمین."""
    return db.query(Activation).all()

# 2. ثبت درخواست سخت افزار (کاربر ID ها را می فرستد)
@router.post("/request", response_model=ActivationOut, status_code=status.HTTP_201_CREATED)
def request_activation(request: ActivationRequest, db: Session = Depends(get_db)):
    """ثبت شناسه های سخت افزاری کاربر برای تولید کد فعال سازی توسط برنامه نویس."""
    try:
        return crud.create_activation_request(db, request)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"خطا در ثبت درخواست: {str(e)}")

# 3. اعتبار سنجی کد و فعال سازی
@router.post("/validate", response_model=ActivationOut)
def validate_activation(validation_data: ActivationCodeValidation, db: Session = Depends(get_db)):
    """اعتبار سنجی کد فعال سازی و فعال کردن برنامه برای ۶ ماه."""
    activation_record, message = crud.validate_activation_code(db, validation_data)
    
    if activation_record:
        return activation_record
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

# 4. چک کردن وضعیت (برای برنامه اصلی مشتری)
@router.get("/status/{motherboard_code}", response_model=ActivationStatusOut)
def get_status(motherboard_code: str, db: Session = Depends(get_db)):
    """دریافت وضعیت فعال سازی برنامه: فعال، غیرفعال یا منقضی شده."""
    return crud.get_activation_status(db, motherboard_code)