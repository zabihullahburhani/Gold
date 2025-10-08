

# backend/app/models/capital.py
from sqlalchemy import Column, Integer, Numeric, Date, func
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base

class Capital(Base):
    __tablename__ = "capital_records"

    id = Column(Integer, primary_key=True, index=True)
    usd_capital = Column(Numeric(15, 2), nullable=False)     # سرمایه دالر
    gold_capital = Column(Numeric(10, 4), nullable=False)    # سرمایه طلا
    date = Column(Date, nullable=False, server_default=func.current_date())
    #date = Column(Date, nullable=False)

    

    money_ledgers = relationship("MoneyLedger", back_populates="capital")
    gold_ledgers = relationship("GoldLedger", back_populates="capital")
# link to ledger gold and money to and from