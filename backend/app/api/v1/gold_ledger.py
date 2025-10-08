# app/api/v1/gold_ledger.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.gold_ledger import GoldLedgerCreate, GoldLedgerOut, GoldLedgerUpdate
from app.crud.gold_ledger import (
    create_gold_ledger, 
    get_gold_ledger, 
    get_gold_ledgers, 
    update_gold_ledger, 
    delete_gold_ledger,
    get_customer_gold_balance
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/gold_ledger",
    tags=["gold_ledger"]
)

@router.post("/", response_model=GoldLedgerOut, status_code=status.HTTP_201_CREATED)
def create_gold_ledger_endpoint(
    ledger: GoldLedgerCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    ایجاد یک رکورد جدید در روزنامچه طلا
    """
    try:
        logger.info(f"Creating gold ledger for customer {ledger.customer_id} by user {current_user.get('user_id')}")
        return create_gold_ledger(db, ledger)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating gold ledger: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="خطا در ایجاد رکورد")

@router.get("/", response_model=List[GoldLedgerOut])
def read_gold_ledgers(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    customer_id: Optional[int] = Query(None, description="فیلتر بر اساس شناسه مشتری"),
    start_date: Optional[str] = Query(None, description="تاریخ شروع (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="تاریخ پایان (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="شماره صفحه"),
    limit: int = Query(10, ge=1, le=100, description="تعداد در هر صفحه")
):
    """
    دریافت لیست رکوردهای روزنامچه طلا با قابلیت فیلتر و صفحه‌بندی
    """
    try:
        skip = (page - 1) * limit
        ledgers = get_gold_ledgers(
            db, 
            customer_id=customer_id, 
            start_date=start_date, 
            end_date=end_date, 
            skip=skip, 
            limit=limit
        )
        return ledgers
    except Exception as e:
        logger.error(f"Error retrieving gold ledgers: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="خطا در دریافت داده‌ها")

@router.get("/{gold_ledger_id}", response_model=GoldLedgerOut)
def read_gold_ledger(
    gold_ledger_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    دریافت یک رکورد خاص از روزنامچه طلا
    """
    ledger = get_gold_ledger(db, gold_ledger_id)
    if not ledger:
        raise HTTPException(status_code=404, detail="رکورد روزنامچه طلا یافت نشد")
    return ledger

@router.put("/{gold_ledger_id}", response_model=GoldLedgerOut)
def update_gold_ledger_endpoint(
    gold_ledger_id: int,
    ledger: GoldLedgerUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    به‌روزرسانی یک رکورد روزنامچه طلا
    """
    try:
        updated = update_gold_ledger(db, gold_ledger_id, ledger)
        if not updated:
            raise HTTPException(status_code=404, detail="رکورد روزنامچه طلا یافت نشد")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating gold ledger {gold_ledger_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="خطا در به‌روزرسانی رکورد")

@router.delete("/{gold_ledger_id}")
def delete_gold_ledger_endpoint(
    gold_ledger_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    حذف یک رکورد از روزنامچه طلا
    """
    success = delete_gold_ledger(db, gold_ledger_id)
    if not success:
        raise HTTPException(status_code=404, detail="رکورد روزنامچه طلا یافت نشد")
    return {"message": "رکورد روزنامچه طلا با موفقیت حذف شد"}

@router.get("/customer/{customer_id}/balance")
def get_customer_balance(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    دریافت بیلانس طلای فعلی یک مشتری
    """
    try:
        balance = get_customer_gold_balance(db, customer_id)
        return {
            "customer_id": customer_id,
            "gold_balance": float(balance),
            "currency": "توله"
        }
    except Exception as e:
        logger.error(f"Error getting balance for customer {customer_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="خطا در دریافت بیلانس")