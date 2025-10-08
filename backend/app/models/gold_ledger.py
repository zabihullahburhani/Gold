# app/models/gold_ledger.py

from sqlalchemy import Column, Integer, Numeric, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from app.core.database import Base
from sqlalchemy.sql import func

class GoldLedger(Base):
    __tablename__ = "gold_ledger"

    gold_ledger_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id", ondelete="CASCADE"), nullable=False)
    capital_id = Column(Integer, ForeignKey("capital_records.id", ondelete="SET NULL"), nullable=True)
    transaction_date = Column(TIMESTAMP, nullable=False, default=func.now())
    description = Column(Text, nullable=False)
    received = Column(Numeric(10, 4), nullable=False, default=0)
    paid = Column(Numeric(10, 4), nullable=False, default=0)
    heel_purity_carat = Column(Numeric(5, 3), nullable=True)
    balance = Column(Numeric(10, 4), nullable=False, default=0)

    # روابط
    customer = relationship("Customer", back_populates="gold_ledgers")
    capital = relationship("Capital", back_populates="gold_ledgers")

    def __repr__(self):
        return f"<GoldLedger(id={self.gold_ledger_id}, customer={self.customer_id}, balance={self.balance})>"