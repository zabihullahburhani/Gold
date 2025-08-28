# path: backend/app/schemas/customer.py
"""
Pydantic schemas for Customer endpoints.
Compatible with Pydantic v2 usage.
"""
from pydantic import BaseModel
from typing import Optional

class CustomerBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerOut(CustomerBase):
    customer_id: int
    created_at: Optional[str] = None

    model_config = {
        "from_attributes": True  # allows SQLAlchemy objects -> Pydantic (pydantic v2)
    }

# created by: professor zabihullah burhani
# ICT and AI and Robotics متخصص
# phone: 0705002913, email: zabihullahburhani@gmail.com
# Address: Takhar University, Computer Science Faculty
