# path: backend/app/models/user.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base

class Employee(Base):
    __tablename__ = "employees"
    employee_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    profile_pic = Column(Text, nullable=True)  # مطابق DB فعلی شما
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    login = relationship("Login", uselist=False, back_populates="employee")

class Login(Base):
    __tablename__ = "logins"
    login_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"))
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    last_login = Column(DateTime, default=datetime.datetime.utcnow)

    employee = relationship("Employee", back_populates="login")

# ---- Optional other tables (matching your DB) ----
class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(Integer, primary_key=True)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    address = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ShopExpense(Base):
    __tablename__ = "shop_expenses"
    expense_id = Column(Integer, primary_key=True)
    expense_type = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    expense_date = Column(DateTime, default=datetime.datetime.utcnow)
    description = Column(Text)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"))

class ShopBalance(Base):
    __tablename__ = "shop_balance"
    balance_id = Column(Integer, primary_key=True)
    gold_balance_grams = Column(Float, default=0)
    cash_balance_usd = Column(Float, default=0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class GoldType(Base):
    __tablename__ = "gold_types"
    gold_type_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)

class GoldRate(Base):
    __tablename__ = "gold_rates"
    rate_id = Column(Integer, primary_key=True)
    gold_type_id = Column(Integer, ForeignKey("gold_types.gold_type_id"), nullable=False)
    rate_per_gram = Column(Float, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"
    txn_id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=False)
    gold_type_id = Column(Integer, ForeignKey("gold_types.gold_type_id"), nullable=False)
    grams = Column(Float, nullable=False)
    rate_per_gram = Column(Float, nullable=False)
    total_usd = Column(Float, nullable=False)
    txn_date = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(Text)

class Notification(Base):
    __tablename__ = "notifications"
    notification_id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Integer, default=0)  # sqlite (0/1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    profile_id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=False)
    picture_url = Column(Text)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class ShopAsset(Base):
    __tablename__ = "shop_assets"
    asset_id = Column(Integer, primary_key=True)
    type = Column(String, nullable=False)  # "logo" | "banner"
    file_url = Column(Text, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("employees.employee_id"))
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

# created by: professor zabihullah burhani
# ICT and AI and Robotics متخصص
# phone: 0705002913, email: zabihullahburhani@gmail.com
# Address: Takhar University, COmputer science faculty.
