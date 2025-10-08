# path: backend/app/api/v1/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, hash_password
from app.schemas.user import LoginIn, TokenOut, SecurityQuestionRequest, SecurityQuestionAnswer, ResetPasswordConfirm, UserProfile
from app.crud.user import get_login_by_username
from app.crud.notification import create_notification
from app.schemas.notification import NotificationCreate
from app.models.user import Login
from app.core.security import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

# سوالات امنیتی ثابت (برای سادگی)
SECURITY_QUESTIONS = [
    "نام اولین معلم شما چیست؟",
    "نام بابای شما چیست؟",
]
# ذخیره موقت پاسخ‌ها (در عمل، باید از یک ذخیره امن‌تر مانند Redis استفاده شود)
TEMP_ANSWERS = {}  # {username: {"question1": "answer1", "question2": "answer2"}}

@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    login_row = get_login_by_username(db, payload.username)
    if not login_row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(payload.password, login_row.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    role = login_row.employee.role if login_row.employee else "user"
    token = create_access_token(username=login_row.username, role=role)
    login_row.last_login = datetime.utcnow()
    db.add(login_row)
    db.commit()

    if login_row.employee_id:
        notif = NotificationCreate(
            employee_id=login_row.employee_id,
            title="ورود موفق",
            message=f"کاربر {login_row.username} با موفقیت وارد شد."
        )
        create_notification(db, notif)

    return {"access_token": token, "role": role}

@router.post("/logout")
def logout(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    username = current_user.get("username")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    login_row = db.query(Login).filter(Login.username == username).first()
    if not login_row:
        return {"message": "Logout recorded (no employee mapping found)."}

    employee_id = login_row.employee_id
    if employee_id:
        try:
            notif = NotificationCreate(
                employee_id=employee_id,
                title="خروج از سیستم",
                message=f"کاربر {username} از سیستم خارج شد."
            )
            create_notification(db, notif)
        except Exception as e:
            print("Failed to create logout notification:", e)

    return {"message": "Logout recorded"}

@router.post("/forgot-password")
def forgot_password(request: SecurityQuestionRequest, db: Session = Depends(get_db)):
    login_row = get_login_by_username(db, request.username)
    if not login_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="کاربر یافت نشد")

    return {"questions": SECURITY_QUESTIONS}

@router.post("/verify-security-answers")
def verify_security_answers(request: SecurityQuestionAnswer, db: Session = Depends(get_db)):
    login_row = get_login_by_username(db, request.username)
    if not login_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="کاربر یافت نشد")

    # برای تست، پاسخ‌های ثابت فرض می‌کنیم (در عمل، باید از کاربر دریافت شوند)
    correct_answers = {"question1": "teacher", "question2": "pet"}  # پاسخ‌های پیش‌فرض
    provided_answers = request.answers

    if (
        provided_answers.get("question1") != correct_answers["question1"] or
        provided_answers.get("question2") != correct_answers["question2"]
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="پاسخ‌های امنیتی نادرست")

    # ذخیره موقت تأیید برای بازنشانی
    TEMP_ANSWERS[request.username] = provided_answers
    return {"message": "پاسخ‌ها تأیید شد، می‌توانید رمز جدید وارد کنید"}

@router.post("/reset-password")
def reset_password(confirm: ResetPasswordConfirm, db: Session = Depends(get_db)):
    login_row = get_login_by_username(db, confirm.username)
    if not login_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="کاربر یافت نشد")

    if confirm.username not in TEMP_ANSWERS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="پاسخ‌های امنیتی تأیید نشده‌اند")

    login_row.password_hash = hash_password(confirm.new_password)
    db.commit()
    del TEMP_ANSWERS[confirm.username]  # حذف پاسخ‌های موقت
    return {"message": "رمز عبور با موفقیت بازنشانی شد"}

@router.get("/me", response_model=UserProfile)
def get_user_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    username = current_user.get("username")
    login_row = db.query(Login).filter(Login.username == username).first()
    if not login_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="کاربر یافت نشد")

    return {
        "username": login_row.username,
        "full_name": login_row.employee.full_name if login_row.employee else "",
        "role": login_row.employee.role if login_row.employee else "user",
        "phone": login_row.employee.phone if login_row.employee else None,
        "profile_pic": login_row.employee.profile_pic if login_row.employee else None,
    }

@router.put("/me")
def update_user_profile(
    payload: UserProfile,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    username = current_user.get("username")
    login_row = db.query(Login).filter(Login.username == username).first()
    if not login_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="کاربر یافت نشد")

    if not login_row.employee:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="کارمند مرتبط یافت نشد")

    login_row.employee.full_name = payload.full_name or login_row.employee.full_name
    login_row.employee.phone = payload.phone or login_row.employee.phone
    if payload.profile_pic:
        login_row.employee.profile_pic = payload.profile_pic
    if payload.password:
        login_row.password_hash = hash_password(payload.password)

    db.commit()
    return {"message": "پروفایل با موفقیت به‌روزرسانی شد"}


# created by: professor zabihullah burhani
# ICT and AI and Robotics متخصص
# phone: 0705002913, email: zabihullahburhani@gmail.com
# Address: Takhar University, COmputer science faculty.
