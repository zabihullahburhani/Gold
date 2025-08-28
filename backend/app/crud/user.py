# backend/app/crud/user.py
# CRUD operations.
# No major changes, but ensure profile_pic is handled as str (file path).

from sqlalchemy.orm import Session
from app.models.user import Employee, Login
from app.schemas.user import EmployeeCreate, EmployeeUpdate
from app.core.security import hash_password
from datetime import datetime

def create_employee(db: Session, emp: EmployeeCreate):
    new_emp = Employee(
        full_name=emp.full_name,
        role=emp.role,
        phone=emp.phone,
        profile_pic=emp.profile_pic,
        created_at=datetime.utcnow()
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)

    login = Login(
        employee_id=new_emp.employee_id,
        username=emp.username,
        password_hash=hash_password(emp.password)
    )
    db.add(login)
    db.commit()
    db.refresh(login)

    return new_emp

def get_employees(db: Session):
    return db.query(Employee).all()

def get_employee(db: Session, employee_id: int):
    return db.query(Employee).filter(Employee.employee_id == employee_id).first()

def update_employee(db: Session, employee_id: int, data: EmployeeUpdate):
    emp = get_employee(db, employee_id)
    if not emp:
        return None
    if data.full_name is not None:
        emp.full_name = data.full_name
    if data.role is not None:
        emp.role = data.role
    if data.phone is not None:
        emp.phone = data.phone
    if data.profile_pic is not None:
        emp.profile_pic = data.profile_pic  # Update with new file path
    db.commit()
    db.refresh(emp)
    return emp

def delete_employee(db: Session, employee_id: int):
    emp = get_employee(db, employee_id)
    if not emp:
        return None
    login = db.query(Login).filter(Login.employee_id == employee_id).first()
    if login:
        db.delete(login)
    db.delete(emp)
    db.commit()
    return emp

def get_employee_by_username(db: Session, username: str):
    return db.query(Employee).join(Login).filter(Login.username == username).first()

def get_login_by_username(db: Session, username: str):
    return db.query(Login).filter(Login.username == username).first()
