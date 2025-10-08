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
    # gold_type_id: int # ⬅ حذف شد
    
    # ⬅ فیلدهای جدید ورودی
    weight: float = Field(..., gt=0, description="وزن به گرام")
    source_carat: float = Field(..., gt=0, description="عیار مبدا")
    gold_rate: float = Field(..., gt=0, description="نرخ توله")
    gold_amount: float = Field(..., ge=0, description="مقدار طلا به عیار 23.88 (محاسبه شده)")
    
    type: str = Field(..., pattern="^(buy|sell)$")
    dollar_in: Optional[float] = 0
    dollar_out: Optional[float] = 0
    gold_in: Optional[float] = 0
    gold_out: Optional[float] = 0
    detail: Optional[str] = None
    date: str

class TransactionCreate(TransactionBase):
    # هنگام ایجاد، فرانت اند باید بالانس‌های اولیه را محاسبه و ارسال کند
    dollar_balance: float
    gold_balance: float
    pass

class TransactionUpdate(TransactionBase):
    # هنگام بروزرسانی، ممکن است بالانس‌ها نیز نیاز به به‌روزرسانی داشته باشند
    dollar_balance: float
    gold_balance: float
    pass

class TransactionInDBBase(TransactionBase):
    txn_id: int
    
    # ⚠️ بالانس‌ها اینجا در Schema تعریف می‌شوند اما در مدل DB نیز وجود دارند
    dollar_balance: float
    gold_balance: float
    
    created_at: datetime

    class Config:
        from_attributes = True

class Transaction(TransactionInDBBase):
    pass