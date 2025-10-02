# نویسنده: ذبیح الله برهانی
# متخصص ICT, AI و رباتیک
# شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

#backend/app/crud/transaction.py

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
    customer_id: Optional[int] = None,   # ⬅ اضافه شد
) -> List[Transaction]:
    query = db.query(Transaction)
    
    if customer_id:
        query = query.filter(Transaction.customer_id == customer_id)  # ⬅ فیلتر مشتری
    
    if search:
        query = query.filter(
            (Transaction.detail.like(f"%{search}%")) |
            (Transaction.type.like(f"%{search}%"))
        )
    
    return query.offset(skip).limit(limit).all()


def create_transaction(db: Session, transaction: TransactionCreate):
    # محاسبه بیلانس
    prev_txns = db.query(Transaction).filter(Transaction.customer_id == transaction.customer_id).all()
    prev_dollar_in = sum(t.dollar_in for t in prev_txns)
    prev_dollar_out = sum(t.dollar_out for t in prev_txns)
    prev_gold_in = sum(t.gold_in for t in prev_txns)
    prev_gold_out = sum(t.gold_out for t in prev_txns)

    dollar_balance = prev_dollar_in - prev_dollar_out + transaction.dollar_in - transaction.dollar_out
    gold_balance = prev_gold_in - prev_gold_out + transaction.gold_in - transaction.gold_out

    db_transaction = Transaction(
        **transaction.model_dump(),
        dollar_balance=dollar_balance,
        gold_balance=gold_balance
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def update_transaction(db: Session, db_transaction: Transaction, transaction_in: TransactionUpdate):
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
        return transaction
    return None


