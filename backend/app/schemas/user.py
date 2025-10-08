# path: backend/app/schemas/user.py
from pydantic import BaseModel
from typing import Optional

class LoginIn(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

  # ----- Employee -----
class EmployeeCreate(BaseModel):
    full_name: str
    username: str
    password: str
    role: str = "user"
    phone: Optional[str] = None

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None  # تغییر رمز اختیاری

class EmployeeOut(BaseModel):
    employee_id: int
    full_name: str
    role: str
    phone: Optional[str] = None
    username: str
    profile_pic: Optional[str] = None

    class Config:
        from_attributes = True  # SQLAlchemy -> Pydantic

  # برای پشتیبانی از ORM (مانند SQLAlchemy)

class SecurityQuestionRequest(BaseModel):
    username: str

class SecurityQuestionAnswer(BaseModel):
    username: str
    answers: dict[str, str]  # مثال: {"question1": "پاسخ1", "question2": "پاسخ2"}

class ResetPasswordConfirm(BaseModel):
    username: str
    new_password: str

class UserProfile(BaseModel):
    username: str
    full_name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    profile_pic: Optional[str] = None
    password: Optional[str] = None
    
# created by: professor zabihullah burhani
# ICT and AI and Robotics متخصص
# phone: 0705002913, email: zabihullahburhani@gmail.com
# Address: Takhar University, COmputer science faculty.
