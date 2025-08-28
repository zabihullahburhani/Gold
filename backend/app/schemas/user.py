# backend/app/schemas/user.py
# Schemas.
# profile_pic is Optional[str] for path.

from pydantic import BaseModel
from typing import Optional

class EmployeeCreate(BaseModel):
    full_name: str
    role: str
    phone: Optional[str] = None
    username: str
    password: str
    profile_pic: Optional[str] = None  # File path after upload

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    profile_pic: Optional[str] = None

class EmployeeOut(BaseModel):
    employee_id: int
    full_name: str
    role: str
    phone: Optional[str] = None
    username: str
    profile_pic: Optional[str] = None

    class Config:
        orm_mode = True

class LoginIn(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str