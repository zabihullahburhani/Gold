# نویسنده: ذبیح الله برهانی
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.
# این فایل شامل مدل‌های داده‌ای (Pydantic schemas) برای اعتبارسنجی و تعریف ساختار داده‌های ورودی و خروجی است.

from pydantic import BaseModel, Field
from typing import Optional

class GoldTypeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None

class GoldTypeCreate(GoldTypeBase):
    pass

class GoldTypeUpdate(GoldTypeBase):
    pass

class GoldTypeInDB(GoldTypeBase):
    gold_type_id: int

    class Config:
        from_attributes = True

class GoldType(GoldTypeInDB):
    pass
