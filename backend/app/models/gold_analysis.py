# نویسنده: ذبیح الله برهانی
# متخصص ICT, AI و رباتیک
# شماره تماس: 0705002913, ایمیل: zabihullahburhani@gmail.com
# آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.

from sqlalchemy import Column, Integer, Float, Date, DateTime, func
from app.core.database import Base

class GoldAnalysis(Base):
    __tablename__ = "gold_analysis"

    id = Column(Integer, primary_key=True, index=True)
    gross_weight = Column(Float, nullable=False)
    initial_purity = Column(Float, nullable=False)
    tola_rate = Column(Float, nullable=False)
    final_weight = Column(Float, nullable=False)
    usd_rate = Column(Float, nullable=False)
    analysis_date = Column(Date, server_default=func.date(func.now()), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
