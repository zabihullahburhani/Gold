from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.money_ledger import MoneyLedgerCreate, MoneyLedgerOut, MoneyLedgerUpdate
from app.crud.money_ledger import (
    create_money_ledger, 
    get_money_ledger, 
    get_money_ledgers, 
    update_money_ledger, 
    delete_money_ledger,
    get_customer_money_balance
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/money_ledger",
    tags=["money_ledger"]
)

@router.post("/", response_model=MoneyLedgerOut, status_code=status.HTTP_201_CREATED)
def create_money_ledger_endpoint(
    ledger: MoneyLedgerCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    ایجاد یک رکورد جدید در روزنامچه دالر
    """
    try:
        logger.info(f"Creating money ledger for customer {ledger.customer_id} by user {current_user.get('user_id')}")
        return create_money_ledger(db, ledger)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating money ledger: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="خطا در ایجاد رکورد")

@router.get("/", response_model=List[MoneyLedgerOut])
def read_money_ledgers(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    customer_id: Optional[int] = Query(None, description="فیلتر بر اساس شناسه مشتری"),
    start_date: Optional[str] = Query(None, description="تاریخ شروع (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="تاریخ پایان (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="شماره صفحه"),
    limit: int = Query(10, ge=1, le=100, description="تعداد در هر صفحه")
):
    """
    دریافت لیست رکوردهای روزنامچه دالر با قابلیت فیلتر و صفحه‌بندی
    """
    try:
        skip = (page - 1) * limit
        ledgers = get_money_ledgers(
            db, 
            customer_id=customer_id, 
            start_date=start_date, 
            end_date=end_date, 
            skip=skip, 
            limit=limit
        )
        return ledgers
    except Exception as e:
        logger.error(f"Error retrieving money ledgers: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="خطا در دریافت داده‌ها")

@router.get("/{money_ledger_id}", response_model=MoneyLedgerOut)
def read_money_ledger(
    money_ledger_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    دریافت یک رکورد خاص از روزنامچه دالر
    """
    ledger = get_money_ledger(db, money_ledger_id)
    if not ledger:
        raise HTTPException(status_code=404, detail="رکورد روزنامچه دالر یافت نشد")
    return ledger

@router.put("/{money_ledger_id}", response_model=MoneyLedgerOut)
def update_money_ledger_endpoint(
    money_ledger_id: int,
    ledger: MoneyLedgerUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    به‌روزرسانی یک رکورد روزنامچه دالر
    """
    try:
        updated = update_money_ledger(db, money_ledger_id, ledger)
        if not updated:
            raise HTTPException(status_code=404, detail="رکورد روزنامچه دالر یافت نشد")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating money ledger {money_ledger_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="خطا در به‌روزرسانی رکورد")

@router.delete("/{money_ledger_id}")
def delete_money_ledger_endpoint(
    money_ledger_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    حذف یک رکورد از روزنامچه دالر
    """
    success = delete_money_ledger(db, money_ledger_id)
    if not success:
        raise HTTPException(status_code=404, detail="رکورد روزنامچه دالر یافت نشد")
    return {"message": "رکورد روزنامچه دالر با موفقیت حذف شد"}

@router.get("/customer/{customer_id}/balance")
def get_customer_balance(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    دریافت بیلانس دالر فعلی یک مشتری
    """
    try:
        balance = get_customer_money_balance(db, customer_id)
        return {
            "customer_id": customer_id,
            "usd_balance": float(balance),
            "currency": "دالر"
        }
    except Exception as e:
        logger.error(f"Error getting balance for customer {customer_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="خطا در دریافت بیلانس")