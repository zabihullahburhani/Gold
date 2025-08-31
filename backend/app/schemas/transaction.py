
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.
# backend/app/schemas/transaction.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TransactionBase(BaseModel):
    customer_id: int
    gold_type_id: int
    grams: float
    rate_per_gram_usd: float
    rate_per_gram_afn: float
    total_usd: float
    total_afn: float
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    txn_id: int
    employee_id: int
    txn_date: datetime
    
    class Config:
        orm_mode = True
