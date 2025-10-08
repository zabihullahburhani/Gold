from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
from decimal import Decimal

class MoneyLedgerBase(BaseModel):
    customer_id: int
    capital_id: Optional[int] = None
    description: Optional[str] = None
    received: float = Field(default=0.0, ge=0, description="مقدار دریافت‌شده دالر")
    paid: float = Field(default=0.0, ge=0, description="مقدار پرداخت‌شده دالر")
    transaction_date: Optional[datetime] = None

    @validator('description')
    def description_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('توضیحات نمی‌تواند خالی باشد')
        return v.strip() if v else v

    @validator('received', 'paid')
    def validate_amounts(cls, v):
        if v < 0:
            raise ValueError('مقادیر نمی‌توانند منفی باشند')
        return round(v, 2)

class MoneyLedgerCreate(MoneyLedgerBase):
    pass

class MoneyLedgerUpdate(BaseModel):
    customer_id: Optional[int] = None
    capital_id: Optional[int] = None
    description: Optional[str] = None
    received: Optional[float] = None
    paid: Optional[float] = None
    transaction_date: Optional[datetime] = None

    @validator('description')
    def description_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('توضیحات نمی‌تواند خالی باشد')
        return v.strip() if v else v

    @validator('received', 'paid')
    def validate_amounts(cls, v):
        if v is not None and v < 0:
            raise ValueError('مقادیر نمی‌توانند منفی باشند')
        return round(v, 2) if v is not None else v

class MoneyLedgerOut(MoneyLedgerBase):
    money_ledger_id: int
    usd_balance: float
    transaction_date: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v)
        }