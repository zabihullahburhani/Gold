# نویسنده: ذبیح الله برهانی
# متخصص ICT, AI و رباتیک
# شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TransactionBase(BaseModel):
    customer_id: int
    employee_id: int
    gold_type_id: int
    grams: float = Field(..., gt=0)
    rate_per_gram_usd: float = Field(..., gt=0)
    rate_per_gram_afn: float = Field(..., gt=0)
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(TransactionBase):
    pass

class TransactionInDBBase(TransactionBase):
    txn_id: int
    total_usd: float
    total_afn: float
    txn_date: datetime

    class Config:
        from_attributes = True

class Transaction(TransactionInDBBase):
    pass