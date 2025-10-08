# نویسنده: ذبیح الله برهانی
# متخصص ICT, AI و رباتیک
# شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

# backend/app/crud/transaction.py

from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from typing import List, Optional

def get_transaction(db: Session, txn_id: int):
    return db.query(Transaction).filter(Transaction.txn_id == txn_id).first()

def get_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    customer_id: Optional[int] = None,
) -> List[Transaction]:
    query = db.query(Transaction)
    
    if customer_id:
        query = query.filter(Transaction.customer_id == customer_id)
    
    if search:
        query = query.filter(
            (Transaction.detail.like(f"%{search}%")) |
            (Transaction.type.like(f"%{search}%"))
        )
    
    # 💡 بهتر است تراکنش‌ها بر اساس تاریخ یا ID مرتب شوند
    return query.order_by(Transaction.txn_id.desc()).offset(skip).limit(limit).all()


def create_transaction(db: Session, transaction: TransactionCreate):
    
    # 💡 اصلاح: استفاده از model_dump(exclude_unset=True) و حذف احتمالی فیلدهای اضافی
    # بهترین روش این است که مطمئن شویم فقط داده‌هایی که ستون مربوطه در مدل دارند ارسال شوند.
    
    # 1. داده‌ها را به دیکشنری تبدیل کنید
    transaction_data = transaction.model_dump()
    
    # 2. شیء مدل SQLAlchemy را به صورت صریح و امن بسازید
    # این روش مطمئن‌ترین راه برای جلوگیری از خطاهای مپینگ است.
    db_transaction = Transaction(
        customer_id=transaction_data["customer_id"],
        type=transaction_data["type"],
        
        # فیلدهای جدید
        weight=transaction_data["weight"],
        source_carat=transaction_data["source_carat"],
        gold_rate=transaction_data["gold_rate"],
        gold_amount=transaction_data["gold_amount"],
        
        # فیلدهای مالی
        dollar_in=transaction_data["dollar_in"],
        dollar_out=transaction_data["dollar_out"],
        gold_in=transaction_data["gold_in"],
        gold_out=transaction_data["gold_out"],
        
        # فیلدهای بالانس (از فرانت‌اند)
        dollar_balance=transaction_data["dollar_balance"],
        gold_balance=transaction_data["gold_balance"],
        
        detail=transaction_data.get("detail"),
        date=transaction_data["date"],
    )
    
    db.add(db_transaction)
    
    # ⬅ خطای شما در اینجا رخ می‌دهد
    db.commit() 
    
    db.refresh(db_transaction)
    return db_transaction



def update_transaction(db: Session, db_transaction: Transaction, transaction_in: TransactionUpdate):
    # ⚠️ توجه: پس از به‌روزرسانی یک تراکنش، بهتر است بالانس تمام تراکنش‌های بعدی همان مشتری نیز در یک سرویس جداگانه به‌روز شوند.
    
    for key, value in transaction_in.model_dump().items():
        setattr(db_transaction, key, value)
        
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def delete_transaction(db: Session, txn_id: int):
    transaction = get_transaction(db, txn_id)
    if transaction:
        db.delete(transaction)
        db.commit()
        # ⚠️ توجه: پس از حذف، بالانس تمام تراکنش‌های بعدی همان مشتری نیز باید در یک سرویس جداگانه به‌روز شود.
        return transaction
    return None