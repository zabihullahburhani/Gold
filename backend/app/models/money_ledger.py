from sqlalchemy import Column, Integer, Numeric, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class MoneyLedger(Base):
    __tablename__ = "money_ledger"

    money_ledger_id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=False)
    capital_id = Column(Integer, ForeignKey("capital_records.id"), nullable=True)
    transaction_date = Column(DateTime, nullable=False, server_default=func.current_timestamp())
    description = Column(Text, nullable=True)
    received = Column(Numeric(15, 2), nullable=False, default=0)
    paid = Column(Numeric(15, 2), nullable=False, default=0)
    usd_balance = Column(Numeric(15, 2), nullable=False, default=0)  # NOT NULL برای اطمینان از عدم وجود null

    customer = relationship("Customer", back_populates="money_ledgers")
    capital = relationship("Capital", back_populates="money_ledgers")