# app/schemas/gold_ledger.py

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal

class GoldLedgerBase(BaseModel):
    customer_id: int
    capital_id: Optional[int] = None
    description: str = Field(..., min_length=1)
    received: float = Field(default=0.0, ge=0, description="مقدار دریافت‌شده طلا (گرم)")
    paid: float = Field(default=0.0, ge=0, description="مقدار پرداخت‌شده طلا (گرم)")
    heel_purity_carat: Optional[float] = Field(default=None, ge=0, le=24, description="عیار پاشنه")
    transaction_date: Optional[datetime] = None

    @validator('description')
    def description_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('توضیحات نمی‌تواند خالی باشد')
        return v.strip()

    @validator('received', 'paid')
    def validate_amounts(cls, v):
        if v < 0:
            raise ValueError('مقادیر نمی‌توانند منفی باشند')
        return round(v, 4)

class GoldLedgerCreate(GoldLedgerBase):
    pass

class GoldLedgerUpdate(BaseModel):
    customer_id: Optional[int] = None
    capital_id: Optional[int] = None
    description: Optional[str] = None
    received: Optional[float] = None
    paid: Optional[float] = None
    heel_purity_carat: Optional[float] = None
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
        return round(v, 4) if v is not None else v

class GoldLedgerOut(GoldLedgerBase):
    gold_ledger_id: int
    balance: float
    transaction_date: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v)
        }