# path: backend/app/api/v1/debts.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import require_admin
from app.schemas.debt import DebtCreate, DebtOut, DebtUpdate
from app.crud.debt import (
    create_debt,
    get_debt,
    get_all_debts,
    update_debt,
    delete_debt,
)

router = APIRouter(prefix="/debts", tags=["debts"])

@router.post("/", response_model=DebtOut)
def create_new_debt(
    debt: DebtCreate, db: Session = Depends(get_db), current=Depends(require_admin)
):
    return create_debt(db, debt)

@router.get("/", response_model=List[DebtOut])
def get_debts(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current=Depends(require_admin)
):
    debts = get_all_debts(db, search=search)
    return debts

@router.put("/{debt_id}", response_model=DebtOut)
def update_existing_debt(
    debt_id: int,
    debt: DebtUpdate,
    db: Session = Depends(get_db),
    current=Depends(require_admin),
):
    updated_debt = update_debt(db, debt_id, debt)
    if not updated_debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    return updated_debt

@router.delete("/{debt_id}")
def delete_existing_debt(
    debt_id: int, db: Session = Depends(get_db), current=Depends(require_admin)
):
    if not delete_debt(db, debt_id):
        raise HTTPException(status_code=404, detail="Debt not found")
    return {"detail": "Debt deleted successfully"}