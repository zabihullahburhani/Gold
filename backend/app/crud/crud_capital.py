

# backend/app/crud/crud_capital.py
from sqlalchemy.orm import Session
from sqlalchemy import desc
from decimal import Decimal
from app.models.capital import Capital
from app.schemas.capital_schema import CapitalCreate, CapitalUpdate

def get_all_capitals(db: Session):
    return db.query(Capital).order_by(Capital.date.desc()).all()

def get_capital(db: Session, capital_id: int):
    return db.query(Capital).filter(Capital.id == capital_id).first()

def create_capital(db: Session, data: CapitalCreate):
    new_capital = Capital(**data.dict())
    db.add(new_capital)
    db.commit()
    db.refresh(new_capital)
    return new_capital

def update_capital(db: Session, capital_id: int, data: CapitalUpdate):
    capital = get_capital(db, capital_id)
    if not capital:
        return None
    for key, value in data.dict().items():
        setattr(capital, key, value)
    db.commit()
    db.refresh(capital)
    return capital

def delete_capital(db: Session, capital_id: int):
    capital = get_capital(db, capital_id)
    if not capital:
        return None
    db.delete(capital)
    db.commit()
    return True
