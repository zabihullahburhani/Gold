# path: backend/app/api/v1/users.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os, shutil

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.schemas.user import EmployeeOut
from app.crud.user import list_users, create_employee, update_employee, delete_employee, change_role

router = APIRouter(prefix="/users", tags=["users"])

PROFILE_PICS_DIR = "static/profile_pics"
os.makedirs(PROFILE_PICS_DIR, exist_ok=True)

@router.get("/", response_model=List[EmployeeOut])
def get_users(db: Session = Depends(get_db), current=Depends(require_admin)):
    rows = list_users(db)
    return [
        EmployeeOut(
            employee_id=r.employee.employee_id,
            full_name=r.employee.full_name,
            role=r.employee.role,
            phone=r.employee.phone,
            username=r.username,
            profile_pic=r.employee.profile_pic
        ) for r in rows
    ]

# Create via FormData (compatible with your CreateUser component)
@router.post("/", response_model=EmployeeOut)
def create_new_user(
    db: Session = Depends(get_db),
    current=Depends(require_admin),
    full_name: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    role: str = Form("user"),
    phone: Optional[str] = Form(None),
    profile_pic: Optional[UploadFile] = File(None),
):
    pic_path = None
    if profile_pic:
        filename = f"{username}_{profile_pic.filename}"
        pic_path = os.path.join(PROFILE_PICS_DIR, filename)
        with open(pic_path, "wb") as f:
            shutil.copyfileobj(profile_pic.file, f)

    emp = create_employee(
        db,
        full_name=full_name,
        role=role,
        phone=phone,
        username=username,
        password=password,
        profile_pic=pic_path,
    )

    return EmployeeOut(
        employee_id=emp.employee_id,
        full_name=emp.full_name,
        role=emp.role,
        phone=emp.phone,
        username=emp.login.username,
        profile_pic=emp.profile_pic,
    )

@router.put("/{employee_id}", response_model=EmployeeOut)
def edit_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current=Depends(require_admin),
    full_name: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    profile_pic: Optional[UploadFile] = File(None),
):
    pic_path = None
    if profile_pic:
        filename = f"{employee_id}_{profile_pic.filename}"
        pic_path = os.path.join(PROFILE_PICS_DIR, filename)
        with open(pic_path, "wb") as f:
            shutil.copyfileobj(profile_pic.file, f)

    emp = update_employee(
        db,
        employee_id,
        full_name=full_name,
        role=role,
        phone=phone,
        password=password,
        profile_pic_path=pic_path,
    )
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    return EmployeeOut(
        employee_id=emp.employee_id,
        full_name=emp.full_name,
        role=emp.role,
        phone=emp.phone,
        username=emp.login.username if emp.login else "",
        profile_pic=emp.profile_pic,
    )

@router.delete("/{employee_id}")
def remove_employee(employee_id: int, db: Session = Depends(get_db), current=Depends(require_admin)):
    ok = delete_employee(db, employee_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"detail": "Employee deleted successfully"}

@router.patch("/{employee_id}/role", response_model=EmployeeOut)
def update_role(employee_id: int, new_role: str = Form(...), db: Session = Depends(get_db), current=Depends(require_admin)):
    emp = change_role(db, employee_id, new_role)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return EmployeeOut(
        employee_id=emp.employee_id,
        full_name=emp.full_name,
        role=emp.role,
        phone=emp.phone,
        username=emp.login.username if emp.login else "",
        profile_pic=emp.profile_pic,
    )

# created by: professor zabihullah burhani
# ICT and AI and Robotics متخصص
# phone: 0705002913, email: zabihullahburhani@gmail.com
# Address: Takhar University, COmputer science faculty.
