# backend/app/schemas/gold_rates.py

from pydantic import BaseModel, ConfigDict
from datetime import datetime

class GoldRateBase(BaseModel):
    rate_per_gram_usd: float
    rate_per_gram_afn: float
    difference_per_gram_usd: float = 0
    difference_per_gram_afn: float = 0

class GoldRateCreate(GoldRateBase):
    pass

class GoldRateOut(GoldRateBase):
    rate_id: int
    final_rate_usd: float
    final_rate_afn: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
