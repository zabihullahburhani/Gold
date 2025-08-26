from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, engine, get_db
from app.core.security import hash_password
from app.models.user import Employee, Login

from app.api.v1 import auth as auth_router
from app.api.v1 import users as users_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GJBMS API", version="1.0.0")

@app.get("/")
def root():
    return {"message": "Backend is running"}

# CORS برای Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include همه روت‌ها زیر /api/v1
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(users_router.router, prefix="/api/v1")

# ساخت کاربران پیش‌فرض
def create_default_users():
    db: Session = next(get_db())
    if not db.query(Login).filter(Login.username == "admin").first():
        admin_emp = Employee(full_name="Admin User", role="admin", phone="000")
        db.add(admin_emp)
        db.commit()
        db.refresh(admin_emp)
        db.add(Login(employee_id=admin_emp.employee_id, username="admin", password_hash=hash_password("1234")))
        db.commit()

    if not db.query(Login).filter(Login.username == "user").first():
        user_emp = Employee(full_name="Normal User", role="user", phone="111")
        db.add(user_emp)
        db.commit()
        db.refresh(user_emp)
        db.add(Login(employee_id=user_emp.employee_id, username="user", password_hash=hash_password("1234")))
        db.commit()

create_default_users()
