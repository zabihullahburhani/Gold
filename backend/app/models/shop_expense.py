# نویسنده: ذبیح الله برهانی
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

# backend/app/models/shop_expense.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class ShopExpense(Base):
    __tablename__ = "shop_expenses"

    expense_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    expense_type = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    expense_date = Column(DateTime, nullable=False, default=datetime.utcnow)  # stored in UTC
    description = Column(Text, nullable=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=True)

    # optional relationship to Employee (employee model assumed in app.models.user)
    employee = relationship("Employee", backref="shop_expenses", foreign_keys=[employee_id])

