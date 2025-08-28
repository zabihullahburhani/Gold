# path: backend/app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.schemas.user import LoginIn, TokenOut
from app.crud.user import get_login_by_username

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    login_row = get_login_by_username(db, payload.username)
    if not login_row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(payload.password, login_row.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # نقش از جدول employee
    role = login_row.employee.role if login_row.employee else "user"

    token = create_access_token(username=login_row.username, role=role)
    login_row.last_login = datetime.utcnow()
    db.add(login_row)
    db.commit()

    return {"access_token": token, "role": role}

# created by: professor zabihullah burhani
# ICT and AI and Robotics متخصص
# phone: 0705002913, email: zabihullahburhani@gmail.com
# Address: Takhar University, COmputer science faculty.
