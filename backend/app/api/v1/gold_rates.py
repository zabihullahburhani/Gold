# backend/app/api/v1/gold_rates.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.gold_rate import GoldRateCreate, GoldRateOut
from app.crud import gold_rate as crud

router = APIRouter(prefix="/gold-rates", tags=["gold_rates"])

@router.post("/", response_model=GoldRateOut, status_code=status.HTTP_201_CREATED)
def create_new_rate(rate: GoldRateCreate, db: Session = Depends(get_db)):
    return crud.create_gold_rate(db, rate)

@router.get("/", response_model=list[GoldRateOut])
def list_rates(db: Session = Depends(get_db)):
    return crud.get_gold_rates(db)

@router.delete("/{rate_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_rate(rate_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_gold_rate(db, rate_id)
    if not ok:
        raise HTTPException(status_code=404, detail="نرخ پیدا نشد")
