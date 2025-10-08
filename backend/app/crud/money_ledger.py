from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy import desc, and_
from app.models.money_ledger import MoneyLedger
from app.models.capital import Capital
from app.schemas.money_ledger import MoneyLedgerCreate, MoneyLedgerUpdate
from typing import List, Optional
from datetime import datetime
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
            func.coalesce(func.sum(MoneyLedger.received), 0),
            func.coalesce(func.sum(MoneyLedger.paid), 0)
        ).filter(
            MoneyLedger.customer_id == customer_id
        ).first()
        
        total_received = result[0] or Decimal('0')
        total_paid = result[1] or Decimal('0')
        balance = total_received - total_paid
        
        logger.info(f"Balance calculated for customer {customer_id}: received={total_received}, paid={total_paid}, balance={balance}")
        return balance
    except Exception as e:
        logger.error(f"Error calculating balance for customer {customer_id}: {str(e)}")
        return Decimal('0')

def get_money_ledger(db: Session, money_ledger_id: int) -> Optional[MoneyLedger]:
    return db.query(MoneyLedger).filter(MoneyLedger.money_ledger_id == money_ledger_id).first()

def get_money_ledgers(
    db: Session,
    customer_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[MoneyLedger]:
    try:
        query = db.query(MoneyLedger)
        
        # فیلتر بر اساس مشتری
        if customer_id:
            query = query.filter(MoneyLedger.customer_id == customer_id)
        
        # فیلتر بر اساس تاریخ
        if start_date and end_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                end_dt = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
                query = query.filter(
                    MoneyLedger.transaction_date.between(start_dt, end_dt)
                )
            except ValueError as e:
                logger.warning(f"Invalid date format: {start_date} or {end_date}. Error: {str(e)}")
        
        # مرتب‌سازی و صفحه‌بندی
        result = query.order_by(desc(MoneyLedger.transaction_date)).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(result)} money ledger records")
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving money ledgers: {str(e)}")
        return []

def create_money_ledger(db: Session, ledger: MoneyLedgerCreate) -> MoneyLedger:
    try:
        # محاسبه بیلانس جدید
        current_balance = calculate_balance(db, ledger.customer_id)
        new_balance = current_balance + Decimal(str(ledger.received)) - Decimal(str(ledger.paid))
        
        # ایجاد رکورد جدید
        db_ledger = MoneyLedger(
            customer_id=ledger.customer_id,
            capital_id=ledger.capital_id,
            description=ledger.description,
            received=Decimal(str(ledger.received)),
            paid=Decimal(str(ledger.paid)),
            usd_balance=new_balance,
            transaction_date=ledger.transaction_date or datetime.now()
        )
        
        db.add(db_ledger)
        db.commit()
        db.refresh(db_ledger)
        
        logger.info(f"Money ledger created successfully: ID={db_ledger.money_ledger_id}, Customer={db_ledger.customer_id}, Balance={db_ledger.usd_balance}")
        return db_ledger
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating money ledger: {str(e)}")
        raise

def update_money_ledger(db: Session, money_ledger_id: int, ledger_update: MoneyLedgerUpdate) -> Optional[MoneyLedger]:
    try:
        db_ledger = get_money_ledger(db, money_ledger_id)
        if not db_ledger:
            return None

        # ذخیره مقادیر قدیمی برای محاسبه مجدد بیلانس
        old_customer_id = db_ledger.customer_id

        # به‌روزرسانی فیلدها
        update_data = ledger_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                setattr(db_ledger, key, value)

        # اگر received یا paid تغییر کرده، بیلانس را مجدداً محاسبه کن
        if 'received' in update_data or 'paid' in update_data:
            customer_id = update_data.get('customer_id', old_customer_id)
            new_balance = calculate_balance(db, customer_id)
            db_ledger.usd_balance = new_balance

        db.commit()
        db.refresh(db_ledger)
        
        logger.info(f"Money ledger updated successfully: ID={db_ledger.money_ledger_id}")
        return db_ledger
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating money ledger {money_ledger_id}: {str(e)}")
        raise

def delete_money_ledger(db: Session, money_ledger_id: int) -> bool:
    try:
        db_ledger = get_money_ledger(db, money_ledger_id)
        if not db_ledger:
            return False

        customer_id = db_ledger.customer_id
        db.delete(db_ledger)
        db.commit()
        
        # پس از حذف، بیلانس سایر رکوردهای مشتری را به‌روز کن
        _recalculate_customer_balance(db, customer_id)
        
        logger.info(f"Money ledger deleted successfully: ID={money_ledger_id}")
        return True
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting money ledger {money_ledger_id}: {str(e)}")
        return False

def _recalculate_customer_balance(db: Session, customer_id: int):
    """
    محاسبه مجدد بیلانس برای تمام رکوردهای یک مشتری
    """
    try:
        ledgers = db.query(MoneyLedger).filter(
            MoneyLedger.customer_id == customer_id
        ).order_by(MoneyLedger.transaction_date, MoneyLedger.money_ledger_id).all()
        
        running_balance = Decimal('0')
        for ledger in ledgers:
            running_balance += ledger.received - ledger.paid
            if ledger.usd_balance != running_balance:
                ledger.usd_balance = running_balance
        
        db.commit()
        logger.info(f"Recalculated balances for customer {customer_id}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error recalculating balances for customer {customer_id}: {str(e)}")
        raise

def get_customer_money_balance(db: Session, customer_id: int) -> Decimal:
    """
    دریافت بیلانس دالر فعلی یک مشتری
    """
    return calculate_balance(db, customer_id)