# app/crud/gold_ledger.py

from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from app.models.gold_ledger import GoldLedger
from app.schemas.gold_ledger import GoldLedgerCreate, GoldLedgerUpdate
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

def calculate_balance(db: Session, customer_id: int) -> Decimal:
    """
    محاسبه بیلانس فعلی برای یک مشتری
    """
    try:
        # جمع تمام رسیدها و گرفت‌های مشتری
        result = db.query(
            db.func.coalesce(db.func.sum(GoldLedger.received), 0),
            db.func.coalesce(db.func.sum(GoldLedger.paid), 0)
        ).filter(
            GoldLedger.customer_id == customer_id
        ).first()
        
        total_received = result[0] or Decimal('0')
        total_paid = result[1] or Decimal('0')
        balance = total_received - total_paid
        
        logger.info(f"Balance calculated for customer {customer_id}: received={total_received}, paid={total_paid}, balance={balance}")
        return balance
    except Exception as e:
        logger.error(f"Error calculating balance for customer {customer_id}: {str(e)}")
        return Decimal('0')

def create_gold_ledger(db: Session, ledger: GoldLedgerCreate) -> GoldLedger:
    try:
        # محاسبه بیلانس جدید
        current_balance = calculate_balance(db, ledger.customer_id)
        new_balance = current_balance + Decimal(str(ledger.received)) - Decimal(str(ledger.paid))
        
        # ایجاد رکورد جدید
        db_ledger = GoldLedger(
            customer_id=ledger.customer_id,
            capital_id=ledger.capital_id,
            description=ledger.description,
            received=Decimal(str(ledger.received)),
            paid=Decimal(str(ledger.paid)),
            heel_purity_carat=Decimal(str(ledger.heel_purity_carat)) if ledger.heel_purity_carat else None,
            balance=new_balance,
            transaction_date=ledger.transaction_date or datetime.now()
        )
        
        db.add(db_ledger)
        db.commit()
        db.refresh(db_ledger)
        
        logger.info(f"Gold ledger created successfully: ID={db_ledger.gold_ledger_id}, Customer={db_ledger.customer_id}, Balance={db_ledger.balance}")
        return db_ledger
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating gold ledger: {str(e)}")
        raise

def get_gold_ledger(db: Session, gold_ledger_id: int) -> GoldLedger | None:
    return db.query(GoldLedger).filter(GoldLedger.gold_ledger_id == gold_ledger_id).first()

def get_gold_ledgers(
    db: Session,
    customer_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[GoldLedger]:
    try:
        query = db.query(GoldLedger)
        
        # فیلتر بر اساس مشتری
        if customer_id:
            query = query.filter(GoldLedger.customer_id == customer_id)
        
        # فیلتر بر اساس تاریخ
        if start_date and end_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                end_dt = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
                query = query.filter(
                    GoldLedger.transaction_date.between(start_dt, end_dt)
                )
            except ValueError as e:
                logger.warning(f"Invalid date format: {start_date} or {end_date}. Error: {str(e)}")
        
        # مرتب‌سازی و صفحه‌بندی
        result = query.order_by(desc(GoldLedger.transaction_date)).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(result)} gold ledger records")
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving gold ledgers: {str(e)}")
        return []

def update_gold_ledger(db: Session, gold_ledger_id: int, ledger_update: GoldLedgerUpdate) -> GoldLedger | None:
    try:
        db_ledger = get_gold_ledger(db, gold_ledger_id)
        if not db_ledger:
            return None

        # ذخیره مقادیر قدیمی برای محاسبه مجدد بیلانس
        old_received = db_ledger.received
        old_paid = db_ledger.paid
        old_customer_id = db_ledger.customer_id

        # به‌روزرسانی فیلدها
        update_data = ledger_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                setattr(db_ledger, key, value)

        # اگر received یا paid تغییر کرده، بیلانس را مجدداً محاسبه کن
        if 'received' in update_data or 'paid' in update_data:
            customer_id = update_data.get('customer_id', old_customer_id)
            new_balance = calculate_balance(db, customer_id)
            db_ledger.balance = new_balance

        db.commit()
        db.refresh(db_ledger)
        
        logger.info(f"Gold ledger updated successfully: ID={db_ledger.gold_ledger_id}")
        return db_ledger
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating gold ledger {gold_ledger_id}: {str(e)}")
        raise

def delete_gold_ledger(db: Session, gold_ledger_id: int) -> bool:
    try:
        db_ledger = get_gold_ledger(db, gold_ledger_id)
        if not db_ledger:
            return False

        customer_id = db_ledger.customer_id
        db.delete(db_ledger)
        db.commit()
        
        # پس از حذف، بیلانس سایر رکوردهای مشتری را به‌روز کن
        _recalculate_customer_balance(db, customer_id)
        
        logger.info(f"Gold ledger deleted successfully: ID={gold_ledger_id}")
        return True
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting gold ledger {gold_ledger_id}: {str(e)}")
        return False

def _recalculate_customer_balance(db: Session, customer_id: int):
    """
    محاسبه مجدد بیلانس برای تمام رکوردهای یک مشتری
    """
    try:
        ledgers = db.query(GoldLedger).filter(
            GoldLedger.customer_id == customer_id
        ).order_by(GoldLedger.transaction_date, GoldLedger.gold_ledger_id).all()
        
        running_balance = Decimal('0')
        for ledger in ledgers:
            running_balance += ledger.received - ledger.paid
            if ledger.balance != running_balance:
                ledger.balance = running_balance
        
        db.commit()
        logger.info(f"Recalculated balances for customer {customer_id}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error recalculating balances for customer {customer_id}: {str(e)}")
        raise

def get_customer_gold_balance(db: Session, customer_id: int) -> Decimal:
    """
    دریافت بیلانس طلای فعلی یک مشتری
    """
    return calculate_balance(db, customer_id)