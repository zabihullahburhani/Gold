# نویسنده: ذبیح الله برهانی
# متخصص ICT, AI و رباتیک
# شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.


#backend/app/schemas/transaction.py


from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TransactionBase(BaseModel):
    customer_id: int
    gold_type_id: int
    type: str = Field(..., pattern="^(buy|sell)$")
    dollar_in: Optional[float] = 0
    dollar_out: Optional[float] = 0
    gold_in: Optional[float] = 0
    gold_out: Optional[float] = 0
    detail: Optional[str] = None
    date: str

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(TransactionBase):
    pass

class TransactionInDBBase(TransactionBase):
    txn_id: int
    dollar_balance: float
    gold_balance: float
    created_at: datetime

    class Config:
        from_attributes = True

class Transaction(TransactionInDBBase):
    pass


