# app/models/customer.py

from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base
from sqlalchemy.orm import relationship
import datetime

class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    
    transactions = relationship("Transaction", back_populates="customer")

    money_ledgers = relationship("MoneyLedger", back_populates="customer")
    
    gold_ledgers = relationship("GoldLedger", back_populates="customer")
