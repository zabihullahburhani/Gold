# نویسنده: ذبیح الله برهانی
# متخصص ICT, AI و رباتیک
# شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

#backend/app/models/transaction.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    txn_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=False)
    gold_type_id = Column(Integer, ForeignKey("gold_types.gold_type_id"), nullable=False)

    type = Column(String, nullable=False)  # buy or sell
    dollar_balance = Column(Float, default=0)
    dollar_in = Column(Float, default=0)
    dollar_out = Column(Float, default=0)
    gold_balance = Column(Float, default=0)
    gold_in = Column(Float, default=0)
    gold_out = Column(Float, default=0)
    detail = Column(Text)
    date = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer", back_populates="transactions")
    gold_type = relationship("GoldType", back_populates="transactions")
