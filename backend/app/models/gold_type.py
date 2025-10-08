# نویسنده: ذبیح الله برهانی
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.
# این فایل مدل دیتابیس SQLAlchemy را بر اساس طرح جدول gold_types تعریف می‌کند.

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class GoldType(Base):
    __tablename__ = "gold_types"
    gold_type_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    
    # اضافه کردن این خط برای ایجاد رابطه با جدول transactions
    #transactions = relationship("Transaction", back_populates="gold_type")