# backend/app/models/user.py
# Models.
# Added created_at to Login if needed, but based on DB schema, it's not there – assume migration done.

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base

class Employee(Base):
    __tablename__ = "employees"
    employee_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    profile_pic = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    login = relationship("Login", uselist=False, back_populates="employee")

class Login(Base):
    __tablename__ = "logins"
    login_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    last_login = Column(DateTime, default=datetime.datetime.utcnow)
    # created_at = Column(DateTime, default=datetime.datetime.utcnow)  # Add if migrated

    employee = relationship("Employee", back_populates="login")
