from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CustomerBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    full_name: Optional[str] = None

class CustomerOut(CustomerBase):
    customer_id: int
    created_at: datetime

    class Config:
        from_attributes = True