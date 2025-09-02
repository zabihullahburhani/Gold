# نویسنده: ذبیح الله برهانی
# متخصص ICT, AI و رباتیک
# شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from typing import List, Optional

def get_transaction(db: Session, txn_id: int):
    return db.query(Transaction).filter(Transaction.txn_id == txn_id).first()

def get_transactions(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[Transaction]:
    query = db.query(Transaction)
    if search:
        # جستجو بر اساس شناسه تراکنش یا فیلدهای مرتبط دیگر
        query = query.filter(
            (Transaction.txn_id.like(f"%{search}%")) |
            (Transaction.notes.like(f"%{search}%"))
        )
    return query.offset(skip).limit(limit).all()

def create_transaction(db: Session, transaction: TransactionCreate):
    total_usd = transaction.grams * transaction.rate_per_gram_usd
    total_afn = transaction.grams * transaction.rate_per_gram_afn
    
    db_transaction = Transaction(
        customer_id=transaction.customer_id,
        employee_id=transaction.employee_id,
        gold_type_id=transaction.gold_type_id,
        grams=transaction.grams,
        rate_per_gram_usd=transaction.rate_per_gram_usd,
        rate_per_gram_afn=transaction.rate_per_gram_afn,
        total_usd=total_usd,
        total_afn=total_afn,
        notes=transaction.notes
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def update_transaction(db: Session, db_transaction: Transaction, transaction_in: TransactionUpdate):
    for key, value in transaction_in.model_dump().items():
        if key == "grams" or key == "rate_per_gram_usd" or key == "rate_per_gram_afn":
            # Recalculate totals on update
            db_transaction.total_usd = transaction_in.grams * transaction_in.rate_per_gram_usd
            db_transaction.total_afn = transaction_in.grams * transaction_in.rate_per_gram_afn
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
