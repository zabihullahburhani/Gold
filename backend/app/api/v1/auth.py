# path: backend/app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.schemas.user import LoginIn, TokenOut
from app.crud.user import get_login_by_username
from app.crud.notification import create_notification
from app.schemas.notification import NotificationCreate
from app.models.user import Login

from app.core.security import get_current_user

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

    # ✅ ثبت نوتیفیکیشن
    if login_row.employee_id:
        notif = NotificationCreate(
            employee_id=login_row.employee_id,
            title="ورود موفق",
            message=f"کاربر {login_row.username} وارد سیستم شد."
        )
        create_notification(db, notif)

    return {"access_token": token, "role": role}


@router.post("/logout")
def logout(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """
    logout endpoint should accept token (Authorization: Bearer <token>).
    It will lookup the login row by username, get employee_id and create a notification.
    """
    username = current_user.get("username")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # پیدا کردن رابطه username -> login_row -> employee_id
    login_row = db.query(Login).filter(Login.username == username).first()
    if not login_row:
        # گزینه: می‌توانیم فقط بازگردانیم بدون خطا اگر mapping موجود نباشد
        return {"message": "Logout recorded (no employee mapping found)."}

    employee_id = login_row.employee_id
    if employee_id:
        try:
            notif = NotificationCreate(
                employee_id=employee_id,
                title="خروج از حساب",
                message=f"کاربر {username} از سیستم خارج شد."
            )
            create_notification(db, notif)
        except Exception as e:
            # لاگ خطا تا ببینیم چرا درج نشد
            # (اگر لازم است خطا را بالا نیاندازید تا logout کاربر مختل نشود)
            print("Failed to create logout notification:", e)

    return {"message": "Logout recorded"}


# created by: professor zabihullah burhani
# ICT and AI and Robotics متخصص
# phone: 0705002913, email: zabihullahburhani@gmail.com
# Address: Takhar University, COmputer science faculty.
