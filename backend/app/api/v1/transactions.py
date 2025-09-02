# نویسنده: ذبیح الله برهانی
# متخصص ICT, AI و رباتیک
# شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.transaction import TransactionCreate, Transaction, TransactionUpdate
from app.crud.transaction import (
    get_transaction,
    get_transactions,
    create_transaction,
    update_transaction,
    delete_transaction
)

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"]
)

@router.post("/", response_model=Transaction, status_code=status.HTTP_201_CREATED)
def create_new_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return create_transaction(db=db, transaction=transaction)

@router.get("/", response_model=List[Transaction])
def read_transactions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    search: Optional[str] = None
):
    transactions = get_transactions(db, search=search)
    return transactions

@router.get("/{txn_id}", response_model=Transaction)
def read_transaction(
    txn_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_transaction = get_transaction(db, txn_id=txn_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction

@router.put("/{txn_id}", response_model=Transaction)
def update_existing_transaction(
    txn_id: int,
    transaction: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_transaction = get_transaction(db, txn_id=txn_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return update_transaction(db=db, db_transaction=db_transaction, transaction_in=transaction)

@router.delete("/{txn_id}")
def delete_existing_transaction(
    txn_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_transaction = delete_transaction(db, txn_id=txn_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}

### **نکات مهم برای فعال‌سازی کامل**


    # path: main.py
    from fastapi import FastAPI
    from app.api.v1 import transactions

    app = FastAPI()
    app.include_router(transactions.router, prefix="/api/v1")
    