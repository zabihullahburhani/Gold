from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import engine, Base
from app.api.v1 import auth, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GJBMS Auth API")

# Static files for profile pics
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with proper prefixes
app.include_router(auth.router, prefix="/api/v1/auth")   # login → /api/v1/auth/login
app.include_router(users.router, prefix="/api/v1/users") # CRUD → /api/v1/users
