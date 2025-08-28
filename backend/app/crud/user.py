# path: backend/app/crud/user.py
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.user import Employee, Login
from app.core.security import hash_password

def get_login_by_username(db: Session, username: str) -> Login | None:
    return db.execute(select(Login).where(Login.username == username)).scalar_one_or_none()

def create_employee(db: Session, full_name: str, role: str, phone: str | None, username: str, password: str, profile_pic: str | None = None) -> Employee:
    employee = Employee(full_name=full_name, role=role, phone=phone, profile_pic=profile_pic)
    db.add(employee)
    db.flush()  # get employee_id before commit

    login = Login(employee_id=employee.employee_id, username=username, password_hash=hash_password(password))
    db.add(login)
    db.commit()
    db.refresh(employee)
    db.refresh(login)
    return employee

def list_users(db: Session) -> list[Login]:
    # برمی‌گرداند لاگین‌ها به همراه employee برای دسترسی به username/role/...
    return db.execute(select(Login)).scalars().all()

def get_employee_by_id(db: Session, employee_id: int) -> Employee | None:
    return db.get(Employee, employee_id)

def update_employee(db: Session, employee_id: int, *, full_name=None, role=None, phone=None, password=None, profile_pic_path=None) -> Employee | None:
    employee = get_employee_by_id(db, employee_id)
    if not employee:
        return None
    if full_name is not None:
        employee.full_name = full_name
    if role is not None:
        employee.role = role
    if phone is not None:
        employee.phone = phone
    if profile_pic_path is not None:
        employee.profile_pic = profile_pic_path
    if password:
        if not employee.login:
            # اگر به هر دلیل login نداشت
            login = Login(employee_id=employee.employee_id, username=f"user{employee.employee_id}", password_hash=hash_password(password))
            db.add(login)
        else:
            employee.login.password_hash = hash_password(password)

    db.commit()
    db.refresh(employee)
    return employee

def delete_employee(db: Session, employee_id: int) -> bool:
    emp = get_employee_by_id(db, employee_id)
    if not emp:
        return False
    if emp.login:
        db.delete(emp.login)
    db.delete(emp)
    db.commit()
    return True

def change_role(db: Session, employee_id: int, new_role: str) -> Employee | None:
    emp = get_employee_by_id(db, employee_id)
    if not emp:
        return None
    emp.role = new_role
    db.commit()
    db.refresh(emp)
    return emp

# created by: professor zabihullah burhani
# ICT and AI and Robotics متخصص
# phone: 0705002913, email: zabihullahburhani@gmail.com
# Address: Takhar University, COmputer science faculty.
