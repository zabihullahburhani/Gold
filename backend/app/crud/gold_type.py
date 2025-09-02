# نویسنده: ذبیح الله برهانی
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.
# این فایل حاوی تمام عملیات CRUD برای مدیریت انواع طلا در دیتابیس است.

from sqlalchemy.orm import Session
from app.models.gold_type import GoldType
from app.schemas.gold_type import GoldTypeCreate, GoldTypeUpdate
from typing import List

def get_gold_type(db: Session, gold_type_id: int):
    return db.query(GoldType).filter(GoldType.gold_type_id == gold_type_id).first()

def get_all_gold_types(db: Session, skip: int = 0, limit: int = 100) -> List[GoldType]:
    return db.query(GoldType).offset(skip).limit(limit).all()

def create_gold_type(db: Session, gold_type: GoldTypeCreate):
    db_gold_type = GoldType(name=gold_type.name, description=gold_type.description)
    db.add(db_gold_type)
    db.commit()
    db.refresh(db_gold_type)
    return db_gold_type

def update_gold_type(db: Session, db_gold_type: GoldType, gold_type_in: GoldTypeUpdate):
    for key, value in gold_type_in.model_dump(exclude_unset=True).items():
        setattr(db_gold_type, key, value)
    db.commit()
    db.refresh(db_gold_type)
    return db_gold_type

def delete_gold_type(db: Session, gold_type_id: int):
    gold_type = get_gold_type(db, gold_type_id)
    if gold_type:
        db.delete(gold_type)
        db.commit()
        return gold_type
    return None
