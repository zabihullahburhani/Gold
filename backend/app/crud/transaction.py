
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.
# backend/app/crud/transaction.py

from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate
from typing import List

def create_transaction(db: Session, transaction: TransactionCreate, employee_id: int):
    db_transaction = Transaction(
        **transaction.dict(),
        employee_id=employee_id
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def get_all_transactions(db: Session):
    return db.query(Transaction).all()

def get_transactions_by_employee(db: Session, employee_id: int):
    return db.query(Transaction).filter(Transaction.employee_id == employee_id).all()
