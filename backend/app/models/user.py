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
    #transactions = relationship("Transaction", back_populates="employee")
    expenses = relationship("ShopExpense", back_populates="employee", overlaps="expenses")
    notifications = relationship("Notification", back_populates="employee")


class Login(Base):
    __tablename__ = "logins"
    login_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"))
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    last_login = Column(DateTime, default=datetime.datetime.utcnow)

    employee = relationship("Employee", back_populates="login")




# created by: professor zabihullah burhani
# ICT and AI and Robotics متخصص
# phone: 0705002913, email: zabihullahburhani@gmail.com
# Address: Takhar University, COmputer science faculty.
