# backend/app/api/v1/shop_expenses.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.shop_expense import ShopExpenseCreate, ShopExpenseOut, ShopExpenseUpdate
from app.crud.shop_expense import (
    get_expense, get_expenses, create_expense, update_expense, delete_expense
)

# models for lookups
from app.models.user import Login, Employee

# notifications
from app.schemas.notification import NotificationCreate
from app.crud.notification import create_notification

# for jalali conversion
import jdatetime
import pytz

router = APIRouter(prefix="/shop-expenses", tags=["shop-expenses"])

def utc_to_kabul_jalali(dt: Optional[datetime]) -> Optional[str]:
    if not dt:
        return None
    # ensure tz-aware
    if dt.tzinfo is None:
        # treat as UTC
        dt = dt.replace(tzinfo=timezone.utc)
    tz = pytz.timezone("Asia/Kabul")
    dt_kabul = dt.astimezone(tz)
    jdt = jdatetime.datetime.fromgregorian(datetime=dt_kabul)
    # format: YYYY-MM-DD HH:MM:SS (هجری شمسی)
    return jdt.strftime("%Y-%m-%d %H:%M:%S")

@router.get("/", response_model=List[ShopExpenseOut])
def read_expenses(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    employee_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 200
):
    rows = get_expenses(db, skip=skip, limit=limit, employee_id=employee_id)
    out = []
    for r in rows:
        item = ShopExpenseOut.from_orm(r).model_dump()
        # add jalali representation
        item["expense_date_jalali"] = utc_to_kabul_jalali(r.expense_date)
        out.append(item)
    return out

@router.post("/", response_model=ShopExpenseOut, status_code=status.HTTP_201_CREATED)
def create_new_expense(
    expense: ShopExpenseCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # اگر employee_id در payload نباشد، سعی کن از توکن username -> login row -> employee_id استخراج شود
    emp_id = expense.employee_id
    if not emp_id:
        username = current_user.get("username")
        if username:
            login_row = db.query(Login).filter(Login.username == username).first()
            if login_row and login_row.employee_id:
                emp_id = login_row.employee_id

    data = expense.model_dump(exclude_none=True)
    if emp_id:
        data["employee_id"] = emp_id

    db_exp = create_expense(db, ShopExpenseCreate(**data))

    # ثبت نوتیفیکیشن (دلخواه اما مفید)
    try:
        if emp_id:
            notif = NotificationCreate(
                employee_id=emp_id,
                title="مصرف جدید",
                message=f"مصرف {db_exp.expense_type} به مبلغ {db_exp.amount} ثبت شد."
            )
            create_notification(db, notif)
    except Exception as e:
        # لاگ کن ولی شکست نده
        print("Failed to create shop expense notification:", e)

    out = ShopExpenseOut.from_orm(db_exp).model_dump()
    out["expense_date_jalali"] = utc_to_kabul_jalali(db_exp.expense_date)
    return out

@router.get("/{expense_id}", response_model=ShopExpenseOut)
def read_expense(expense_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    row = get_expense(db, expense_id)
    if not row:
        raise HTTPException(status_code=404, detail="Expense not found")
    out = ShopExpenseOut.from_orm(row).model_dump()
    out["expense_date_jalali"] = utc_to_kabul_jalali(row.expense_date)
    return out

@router.put("/{expense_id}", response_model=ShopExpenseOut)
def update_existing_expense(expense_id: int, expense_in: ShopExpenseUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_exp = get_expense(db, expense_id)
    if not db_exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    updated = update_expense(db, db_exp, expense_in)
    out = ShopExpenseOut.from_orm(updated).model_dump()
    out["expense_date_jalali"] = utc_to_kabul_jalali(updated.expense_date)
    return out

@router.delete("/{expense_id}")
def delete_existing_expense(expense_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    ok = delete_expense(db, expense_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted"}
