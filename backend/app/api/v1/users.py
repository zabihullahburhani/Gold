# backend/app/api/v1/users.py
# This file handles CRUD operations for employees.
# Added support for file upload (profile_pic) using UploadFile.
# Full paths are /api/v1/employees for consistency.
# Removed duplicate login endpoint.
# Created by: Professor Zabihullah Burhani
# ICT and AI and Robotics Specialist
# Phone: 0705002913, Email: zabihullahburhani@gmail.com
# Address: Takhar University, Computer Science Faculty.

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
from datetime import datetime

from app.schemas.user import EmployeeCreate, EmployeeUpdate, EmployeeOut
from app.crud.user import create_employee, get_employees, get_employee, update_employee, delete_employee
from app.core.database import get_db
from app.core.security import require_admin  # Optional for admin-only access

router = APIRouter( tags=["Employees"])  # Prefix /employees, full path /api/v1/employees

UPLOAD_DIR = "uploads/profile_pics"  # Directory to save uploaded files
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Create directory if not exists

# Helper to save uploaded file and return path
async def save_uploaded_file(file: UploadFile) -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
    file_path = os.path.join(UPLOAD_DIR, f"{timestamp}.{file_extension}")
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    return file_path

# Create employee with file upload support
@router.post("/", response_model=EmployeeOut)
async def create_employee(
    full_name: str,
    role: str,
    username: str,
    password: str,
    phone: str = None,
    profile_pic: UploadFile = File(None),
    db: Session = Depends(get_db)
    # user: dict = Depends(require_admin)  # Uncomment for admin-only
):
    file_path = None
    if profile_pic:
        file_path = await save_uploaded_file(profile_pic)
    emp_data = EmployeeCreate(full_name=full_name, role=role, phone=phone, username=username, password=password, profile_pic=file_path)
    return create_employee(db, emp_data)

# List all employees
@router.get("/", response_model=list[EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    return get_employees(db)

# Get employee by ID
@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = get_employee(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

# Update employee with file upload support
@router.put("/{employee_id}", response_model=EmployeeOut)
async def update_employee(
    employee_id: int,
    full_name: str = None,
    role: str = None,
    phone: str = None,
    username: str = None,
    password: str = None,
    profile_pic: UploadFile = File(None),
    db: Session = Depends(get_db)
    # user: dict = Depends(require_admin)  # Uncomment for admin-only
):
    file_path = None
    if profile_pic:
        file_path = await save_uploaded_file(profile_pic)
    data = EmployeeUpdate(full_name=full_name, role=role, phone=phone, profile_pic=file_path)
    emp = update_employee(db, employee_id, data)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    # If username or password provided, update login (assuming separate logic if needed)
    if username or password:
        # Add logic to update login if necessary (e.g., via crud)
        pass  # For now, assume username not updatable or handle in crud
    return emp

# Delete employee
@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = delete_employee(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    # Optionally delete profile_pic file from disk
    if emp.profile_pic:
        try:
            os.remove(emp.profile_pic)
        except OSError:
            pass
    return {"message": "Employee deleted successfully"}
