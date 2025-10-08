# نویسنده: ذبیح الله برهانی
# متخصص ICT, AI و رباتیک
# شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.gold_analysis import GoldAnalysis, GoldAnalysisCreate, GoldAnalysisUpdate, GoldAnalysisFilter
from app.crud.gold_analysis import (
    create_gold_analysis,
    get_gold_analysis,
    get_gold_analyses,
    update_gold_analysis,
    delete_gold_analysis,
    count_gold_analyses,
)

router = APIRouter(prefix="/gold-analysis", tags=["Gold Analysis"])

# ✅ ایجاد رکورد جدید
@router.post("/", response_model=GoldAnalysis, status_code=status.HTTP_201_CREATED)
def create_analysis(data: GoldAnalysisCreate, db: Session = Depends(get_db)):
    return create_gold_analysis(db=db, data=data)

# ✅ واکشی تمام رکوردها با فیلتر تاریخ
@router.get("/", response_model=List[GoldAnalysis])
def read_all_analyses(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 10,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    skip = (page - 1) * limit
    return get_gold_analyses(db, start_date=start_date, end_date=end_date, skip=skip, limit=limit)

# ✅ واکشی رکورد خاص
@router.get("/{gold_id}", response_model=GoldAnalysis)
def read_analysis(gold_id: int, db: Session = Depends(get_db)):
    analysis = get_gold_analysis(db, gold_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Record not found")
    return analysis

# ✅ بروزرسانی رکورد
@router.put("/{gold_id}", response_model=GoldAnalysis)
def update_analysis(gold_id: int, updates: GoldAnalysisUpdate, db: Session = Depends(get_db)):
    db_gold = get_gold_analysis(db, gold_id)
    if not db_gold:
        raise HTTPException(status_code=404, detail="Record not found")
    return update_gold_analysis(db, db_gold, updates)

# ✅ حذف رکورد
@router.delete("/{gold_id}")
def delete_analysis(gold_id: int, db: Session = Depends(get_db)):
    deleted = delete_gold_analysis(db, gold_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Record deleted successfully"}
