# backend/app/crud/gold_rates.py

from sqlalchemy.orm import Session
from app.models.gold_rate import GoldRate
from app.schemas.gold_rate import GoldRateCreate

def create_gold_rate(db: Session, rate: GoldRateCreate):
    final_usd = rate.rate_per_gram_usd + rate.difference_per_gram_usd
    final_afn = rate.rate_per_gram_afn + rate.difference_per_gram_afn

    db_rate = GoldRate(
        rate_per_gram_usd=rate.rate_per_gram_usd,
        rate_per_gram_afn=rate.rate_per_gram_afn,
        difference_per_gram_usd=rate.difference_per_gram_usd,
        difference_per_gram_afn=rate.difference_per_gram_afn,
        final_rate_usd=final_usd,
        final_rate_afn=final_afn,
    )
    db.add(db_rate)
    db.commit()
    db.refresh(db_rate)
    return db_rate

def get_gold_rates(db: Session):
    return db.query(GoldRate).order_by(GoldRate.created_at.desc()).all()

def delete_gold_rate(db: Session, rate_id: int):
    db_rate = db.query(GoldRate).filter(GoldRate.rate_id == rate_id).first()
    if db_rate:
        db.delete(db_rate)
        db.commit()
        return True
    return False
