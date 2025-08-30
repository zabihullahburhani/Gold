# path: backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
#from app.api.v1.customers import router as customers_router

# اگر لازم شد جداول جدید ساخته شوند (برای SQLite)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# سرو کردن عکس‌های پروفایل
app.mount("/static", StaticFiles(directory="static"), name="static")

# API v1
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
#customer
#app.include_router(customers_router, prefix="/api/v1")
@app.get("/health")
def health():
    return {"status": "ok"}

# created by: professor zabihullah burhani
# ICT and AI and Robotics متخصص
# phone: 0705002913, email: zabihullahburhani@gmail.com
# Address: Takhar University, COmputer science faculty.
