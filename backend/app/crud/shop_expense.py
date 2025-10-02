# backend/app/crud/shop_expense.py
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.shop_expense import ShopExpense
from app.schemas.shop_expense import ShopExpenseCreate, ShopExpenseUpdate

def get_expense(db: Session, expense_id: int) -> Optional[ShopExpense]:
    return db.query(ShopExpense).filter(ShopExpense.expense_id == expense_id).first()

def get_expenses(db: Session,
                 skip: int = 0,
                 limit: int = 200,
                 employee_id: Optional[int] = None,
                 from_date: Optional[datetime] = None,
                 to_date: Optional[datetime] = None) -> List[ShopExpense]:
    q = db.query(ShopExpense)
    if employee_id:
        q = q.filter(ShopExpense.employee_id == employee_id)
    if from_date:
        q = q.filter(ShopExpense.expense_date >= from_date)
    if to_date:
        q = q.filter(ShopExpense.expense_date <= to_date)
    return q.order_by(ShopExpense.expense_date.desc()).offset(skip).limit(limit).all()

def create_expense(db: Session, expense_in: ShopExpenseCreate) -> ShopExpense:
    data = expense_in.model_dump(exclude_none=True)
    # if expense_date provided as string/datetime, it will be handled by SQLAlchemy via Python datetime
    db_exp = ShopExpense(**data)
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp

def update_expense(db: Session, db_expense: ShopExpense, expense_in: ShopExpenseUpdate) -> ShopExpense:
    for key, value in expense_in.model_dump().items():
        if value is not None:
            setattr(db_expense, key, value)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def delete_expense(db: Session, expense_id: int) -> bool:
    exp = get_expense(db, expense_id)
    if not exp:
        return False
    db.delete(exp)
    db.commit()
    return True
