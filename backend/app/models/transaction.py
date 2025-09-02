# نویسنده: ذبیح الله برهانی
# متخصص ICT, AI و رباتیک
# شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.


from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    
    txn_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=False)
    gold_type_id = Column(Integer, ForeignKey("gold_types.gold_type_id"), nullable=False)
    grams = Column(Float, nullable=False)
    rate_per_gram_usd = Column(Float, nullable=False)
    rate_per_gram_afn = Column(Float, nullable=False)
    total_usd = Column(Float, nullable=False)
    total_afn = Column(Float, nullable=False)
    txn_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)

    customer = relationship("Customer", back_populates="transactions")
    employee = relationship("Employee", back_populates="transactions")
    gold_type = relationship("GoldType", back_populates="transactions")