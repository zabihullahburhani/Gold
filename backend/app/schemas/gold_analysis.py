# نویسنده: ذبیح الله برهانی
# متخصص ICT, AI و رباتیک
# شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List

# ثابت‌های محاسباتی
STANDARD_CARAT = 23.88
TOLA_WEIGHT = 12.15

# 📦 مدل ورودی برای ایجاد رکورد جدید
class GoldAnalysisCreate(BaseModel):
    gross_weight: float
    initial_purity: float
    tola_rate: float

# 📦 مدل خروجی (Response)
class GoldAnalysis(BaseModel):
    id: int
    gross_weight: float
    initial_purity: float
    tola_rate: float
    final_weight: float
    usd_rate: float
    analysis_date: date
    created_at: datetime

    class Config:
        orm_mode = True

# 📦 مدل برای به‌روزرسانی رکورد
class GoldAnalysisUpdate(BaseModel):
    gross_weight: Optional[float] = None
    initial_purity: Optional[float] = None
    tola_rate: Optional[float] = None

# 📦 مدل برای پارامترهای جستجو
class GoldAnalysisFilter(BaseModel):
    page: int = 1
    limit: int = 10
    start_date: Optional[str] = None
    end_date: Optional[str] = None
