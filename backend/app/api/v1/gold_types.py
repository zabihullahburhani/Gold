# نویسنده: ذبیح الله برهانی
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.
# این فایل شامل endpoints برای مدیریت انواع طلا است.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user

from app.schemas.gold_type import GoldTypeCreate, GoldTypeUpdate, GoldType

from app.crud.gold_type import (
    get_gold_type,
    get_all_gold_types,
    create_gold_type,
    update_gold_type,
    delete_gold_type
)

router = APIRouter(
    prefix="/gold-types",
    tags=["gold-types"]
)

@router.post("/", response_model=GoldType, status_code=status.HTTP_201_CREATED)
def create_new_gold_type(
    gold_type: GoldTypeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return create_gold_type(db=db, gold_type=gold_type)

@router.get("/", response_model=List[GoldType])
def read_gold_types(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    gold_types = get_all_gold_types(db)
    return gold_types

@router.put("/{gold_type_id}", response_model=GoldType)
def update_existing_gold_type(
    gold_type_id: int,
    gold_type: GoldTypeUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_gold_type = get_gold_type(db, gold_type_id=gold_type_id)
    if db_gold_type is None:
        raise HTTPException(status_code=404, detail="Gold type not found")
    return update_gold_type(db=db, db_gold_type=db_gold_type, gold_type_in=gold_type)

@router.delete("/{gold_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_gold_type(
    gold_type_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_gold_type = delete_gold_type(db, gold_type_id=gold_type_id)
    if db_gold_type is None:
        raise HTTPException(status_code=404, detail="Gold type not found")
