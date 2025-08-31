# روش استاندارد SQLAlchemy برای تعریف مدل
# path: backend/app/models/transaction.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Transaction(Base):
    __tablename__ = 'transactions'

    txn_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey('customers.customer_id'))
    employee_id = Column(Integer, ForeignKey('employees.employee_id'))
    gold_type_id = Column(Integer, ForeignKey('gold_types.gold_type_id'))
    grams = Column(Float)
    rate_per_gram_usd = Column(Float)
    rate_per_gram_afn = Column(Float)
    total_usd = Column(Float)
    total_afn = Column(Float)
    txn_date = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String)

    customer = relationship("Customer", back_populates="transactions")
    employee = relationship("Employee", back_populates="transactions")
    gold_type = relationship("GoldType", back_populates="transactions")