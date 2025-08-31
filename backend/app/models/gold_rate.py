
# app/models/gold_rate.py

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class GoldType(Base):
    """
    Model for gold types (e.g., 24K, 18K).
    """
    __tablename__ = "gold_types"
    gold_type_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    rates = relationship("GoldRate", back_populates="gold_type")

class GoldRate(Base):
    """
    Model for live gold rates.
    """
    __tablename__ = "gold_rates"
    rate_id = Column(Integer, primary_key=True, index=True)
    gold_type_id = Column(Integer, ForeignKey("gold_types.gold_type_id"))
    rate_per_gram_usd = Column(Float, nullable=False)
    rate_per_gram_afn = Column(Float, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)
    gold_type = relationship("GoldType", back_populates="rates")
