# path: backend/app/models/debt.py
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class Debt(Base):
    __tablename__ = "debts"

    debt_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=False)
    gold_grams = Column(Float, nullable=False, default=0.0)
    tola = Column(Float, nullable=False, default=0.0)
    usd = Column(Float, nullable=False, default=0.0)
    afn = Column(Float, nullable=False, default=0.0)
    notes = Column(Text, nullable=True)
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # روابط با جداول دیگر
    customer = relationship("Customer")
    employee = relationship("Employee")
