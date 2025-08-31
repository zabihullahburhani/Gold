# path: backend/app/crud/debt.py
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.models.debt import Debt
from app.schemas.debt import DebtCreate, DebtUpdate

def create_debt(db: Session, debt: DebtCreate):
    db_debt = Debt(**debt.dict())
    db.add(db_debt)
    db.commit()
    db.refresh(db_debt)
    return db_debt

def get_debt(db: Session, debt_id: int) -> Optional[Debt]:
    return db.query(Debt).filter(Debt.debt_id == debt_id).first()

def get_all_debts(db: Session, search: str = None) -> List[Debt]:
    query = db.query(Debt)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Debt.notes.ilike(search_pattern),
                Debt.gold_grams.ilike(search_pattern),
                Debt.tola.ilike(search_pattern),
                Debt.usd.ilike(search_pattern),
                Debt.afn.ilike(search_pattern)
            )
        )
    return query.all()

def update_debt(db: Session, debt_id: int, debt: DebtUpdate) -> Optional[Debt]:
    db_debt = get_debt(db, debt_id)
    if not db_debt:
        return None
    for key, value in debt.dict(exclude_unset=True).items():
        setattr(db_debt, key, value)
    db.commit()
    db.refresh(db_debt)
    return db_debt

def delete_debt(db: Session, debt_id: int) -> bool:
    db_debt = get_debt(db, debt_id)
    if not db_debt:
        return False
    db.delete(db_debt)
    db.commit()
    return True