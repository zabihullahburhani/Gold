# backend/app/schemas/capital_schema.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CapitalBase(BaseModel):
    usd_capital: float
    gold_capital: float
    date: Optional[datetime] = None

class CapitalCreate(CapitalBase):
    pass

class CapitalUpdate(CapitalBase):
    pass

class CapitalOut(CapitalBase):
    id: int

    class Config:
        orm_mode = True
