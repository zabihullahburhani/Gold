
# backend/app/api/v1/capital.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.capital_schema import CapitalCreate, CapitalUpdate, CapitalOut
from app.crud import crud_capital

router = APIRouter(prefix="/capital", tags=["Capital Records"])

@router.get("/", response_model=List[CapitalOut])
def list_capitals(db: Session = Depends(get_db)):
    return crud_capital.get_all_capitals(db)

@router.post("/", response_model=CapitalOut)
def create_capital(data: CapitalCreate, db: Session = Depends(get_db)):
    return crud_capital.create_capital(db, data)

@router.put("/{capital_id}", response_model=CapitalOut)
def update_capital(capital_id: int, data: CapitalUpdate, db: Session = Depends(get_db)):
    updated = crud_capital.update_capital(db, capital_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Record not found")
    return updated

@router.delete("/{capital_id}")
def delete_capital(capital_id: int, db: Session = Depends(get_db)):
    deleted = crud_capital.delete_capital(db, capital_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Deleted successfully"}
