# نویسنده: ذبیح الله برهانی
# متخصص ICT, AI و رباتیک
# شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.
# backend/app/api/v1/transactions.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.transaction import TransactionCreate, Transaction, TransactionUpdate
from app.crud.notification import create_notification
from app.schemas.notification import NotificationCreate
# 👈 اینجا مدل Login را اضافه کنید
from app.models.user import Employee, Login 

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
def create_new_transaction(transaction: TransactionCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
   return create_transaction(db=db, transaction=transaction)



@router.get("/", response_model=List[Transaction])
def read_transactions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    search: Optional[str] = None,
    customer_id: Optional[int] = None,   # ⬅ اضافه شد
):
    transactions = get_transactions(db, search=search, customer_id=customer_id)
    return transactions


@router.get("/{txn_id}", response_model=Transaction)
def read_transaction(txn_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    txn = get_transaction(db, txn_id=txn_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn

@router.put("/{txn_id}", response_model=Transaction)
def update_existing_transaction(txn_id: int, transaction: TransactionUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_txn = get_transaction(db, txn_id=txn_id)
    if not db_txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return update_transaction(db, db_txn, transaction)

@router.delete("/{txn_id}")
def delete_existing_transaction(txn_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    txn = delete_transaction(db, txn_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}


