
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.
# backend/app/api/v1/transactions.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionOut
from app.crud.transaction import create_transaction, get_all_transactions
from app.models.user import Employee

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("/", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def add_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    return create_transaction(db, transaction, current_user.employee_id)

@router.get("/", response_model=List[TransactionOut])
def get_transactions(db: Session = Depends(get_db)):
    return get_all_transactions(db)
