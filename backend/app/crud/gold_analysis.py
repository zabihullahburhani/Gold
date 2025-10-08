# نویسنده: ذبیح الله برهانی
# متخصص ICT, AI و رباتیک
# شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.models.gold_analysis import GoldAnalysis
from app.schemas.gold_analysis import GoldAnalysisCreate, GoldAnalysisUpdate
from datetime import datetime, date

STANDARD_CARAT = 23.88
TOLA_WEIGHT = 12.15


def create_gold_analysis(db: Session, data: GoldAnalysisCreate) -> GoldAnalysis:
    """ایجاد یک تحلیل طلا جدید"""
    final_weight = (data.gross_weight * data.initial_purity) / STANDARD_CARAT
    usd_rate = (final_weight / TOLA_WEIGHT) * data.tola_rate

    gold_record = GoldAnalysis(
        gross_weight=data.gross_weight,
        initial_purity=data.initial_purity,
        tola_rate=data.tola_rate,
        final_weight=final_weight,
        usd_rate=usd_rate,
        analysis_date=date.today(),
    )

    db.add(gold_record)
    db.commit()
    db.refresh(gold_record)
    return gold_record


def get_gold_analysis(db: Session, gold_id: int) -> Optional[GoldAnalysis]:
    return db.query(GoldAnalysis).filter(GoldAnalysis.id == gold_id).first()


def get_gold_analyses(db: Session, start_date=None, end_date=None, skip=0, limit=10) -> List[GoldAnalysis]:
    query = db.query(GoldAnalysis)
    if start_date and end_date:
        query = query.filter(GoldAnalysis.analysis_date.between(start_date, end_date))
    return query.order_by(GoldAnalysis.analysis_date.desc()).offset(skip).limit(limit).all()


def update_gold_analysis(db: Session, db_gold: GoldAnalysis, updates: GoldAnalysisUpdate) -> GoldAnalysis:
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(db_gold, field, value)
    db.commit()
    db.refresh(db_gold)
    return db_gold


def delete_gold_analysis(db: Session, gold_id: int) -> bool:
    db_gold = db.query(GoldAnalysis).filter(GoldAnalysis.id == gold_id).first()
    if db_gold:
        db.delete(db_gold)
        db.commit()
        return True
    return False


def count_gold_analyses(db: Session) -> int:
    return db.query(func.count(GoldAnalysis.id)).scalar()
