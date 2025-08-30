# backend/app/models/customer.py

from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.core.database import Base

class Customer(Base):
    """
    مدل SQLAlchemy برای جدول 'customers'.
    """
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    address = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
