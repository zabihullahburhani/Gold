
# backend/app/models/gold_rates.py

from sqlalchemy import Column, Integer, Float, DateTime, func
from app.core.database import Base

class GoldRate(Base):
    __tablename__ = "gold_rates"

    rate_id = Column(Integer, primary_key=True, index=True)

    # 📌 قیمت پایه
    rate_per_gram_usd = Column(Float, nullable=False)
    rate_per_gram_afn = Column(Float, nullable=False)

    # 📌 اختلاف قیمت (مارژین)
    difference_per_gram_usd = Column(Float, nullable=False, default=0)
    difference_per_gram_afn = Column(Float, nullable=False, default=0)

    # 📌 قیمت نهایی (محاسبه‌شده)
    final_rate_usd = Column(Float, nullable=False)
    final_rate_afn = Column(Float, nullable=False)

    created_at = Column(DateTime, server_default=func.now())
