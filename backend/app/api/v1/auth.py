# backend/app/api/v1/auth.py
# This file handles authentication routes, including login functionality.
# It uses JWT for token creation and verifies credentials against the database.
# Created by: Professor Zabihullah Burhani
# ICT and AI and Robotics Specialist
# Phone: 0705002913, Email: zabihullahburhani@gmail.com
# Address: Takhar University, Computer Science Faculty.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.crud.user import get_login_by_username
from app.schemas.user import LoginIn, TokenOut

router = APIRouter( tags=["auth"])  # Prefix is /auth, so full path /api/v1/auth/login

@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    login_row = get_login_by_username(db, payload.username)
    if not login_row or not verify_password(payload.password, login_row.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    role = login_row.employee.role if login_row.employee else "user"

    token = create_access_token({"sub": login_row.username, "role": role})

    login_row.last_login = datetime.utcnow()
    db.add(login_row)
    db.commit()

    return {"access_token": token, "token_type": "bearer", "role": role}
