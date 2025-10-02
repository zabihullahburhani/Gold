# backend/app/models/activation.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.core.database import Base

class Activation(Base):
    __tablename__ = "activations"

    activation_id = Column(Integer, primary_key=True, index=True)
    motherboard_code = Column(String, nullable=False, unique=True)
    cpu_code = Column(String, nullable=False)
    hdd_code = Column(String, nullable=False)
    mac_code = Column(String, nullable=False)
    activation_code = Column(String, nullable=True)
    is_active = Column(Boolean, default=False)
    expiration_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
