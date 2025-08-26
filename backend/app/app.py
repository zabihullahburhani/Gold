from fastapi import FastAPI
from app.routers import auth, users

app = FastAPI()

# include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
