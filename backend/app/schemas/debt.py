# path: backend/app/schemas/debt.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DebtBase(BaseModel):
    customer_id: int
    employee_id: int
    gold_grams: float
    tola: float
    usd: float
    afn: float
    notes: Optional[str] = None
    is_paid: Optional[bool] = False

class DebtCreate(DebtBase):
    pass

class DebtUpdate(DebtBase):
    customer_id: Optional[int] = None
    employee_id: Optional[int] = None
    gold_grams: Optional[float] = None
    tola: Optional[float] = None
    usd: Optional[float] = None
    afn: Optional[float] = None
    is_paid: Optional[bool] = None

class DebtOut(DebtBase):
    debt_id: int
    created_at: datetime

    class Config:
        from_attributes = True