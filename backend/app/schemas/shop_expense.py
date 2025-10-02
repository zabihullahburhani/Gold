# backend/app/schemas/shop_expense.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ShopExpenseBase(BaseModel):
    expense_type: str = Field(..., example="برق")
    amount: float = Field(..., gt=0, example=1200.5)
    expense_date: Optional[datetime] = None  # client may send ISO datetime; if None -> now
    description: Optional[str] = None
    employee_id: Optional[int] = None

class ShopExpenseCreate(ShopExpenseBase):
    pass

class ShopExpenseUpdate(BaseModel):
    expense_type: Optional[str] = None
    amount: Optional[float] = None
    expense_date: Optional[datetime] = None
    description: Optional[str] = None
    employee_id: Optional[int] = None

class ShopExpenseOut(BaseModel):
    expense_id: int
    expense_type: str
    amount: float
    expense_date: datetime  # UTC datetime
    expense_date_jalali: Optional[str] = None  # اضافه شده برای نمایش هجری شمسی
    description: Optional[str] = None
    employee_id: Optional[int] = None

    class Config:
        from_attributes = True
