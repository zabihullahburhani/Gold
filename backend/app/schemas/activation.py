# backend/app/schemas/activation.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ActivationRequest(BaseModel):
    motherboard_code: str
    cpu_code: str
    hdd_code: str
    mac_code: str

class ActivationCodeValidation(BaseModel):
    motherboard_code: str
    activation_code: str

class ActivationOut(BaseModel):
    activation_id: int
    motherboard_code: str
    is_active: bool
    expiration_date: Optional[datetime]
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class ActivationStatusOut(BaseModel):
    is_active: bool
    remaining_days: int
    expiration_date: Optional[datetime]
