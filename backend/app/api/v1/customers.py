# path: backend/app/api/v1/customers.py
"""
FastAPI routes for customers:
- POST   /api/v1/customers/        create
- GET    /api/v1/customers/        list
- GET    /api/v1/customers/{id}    retrieve
- PUT    /api/v1/customers/{id}    update
- DELETE /api/v1/customers/{id}    delete

Authentication: requires a logged-in user (get_current_user).
You may restrict some endpoints to admin by using require_admin dependency.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate
from app.crud.customer import create_customer, list_customers, get_customer, update_customer, delete_customer

router = APIRouter(prefix="/customers", tags=["customers"])

# Create customer (any authenticated user)
@router.post("/", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def api_create_customer(payload: CustomerCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    cust = create_customer(db, full_name=payload.full_name, phone=payload.phone, address=payload.address)
    return cust

# List customers (any authenticated user)
@router.get("/", response_model=List[CustomerOut])
def api_list_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current=Depends(get_current_user)):
    rows = list_customers(db, skip=skip, limit=limit)
    return rows

# Get single customer (any authenticated user)
@router.get("/{customer_id}", response_model=CustomerOut)
def api_get_customer(customer_id: int, db: Session = Depends(get_db), current=Depends(get_current_user)):
    cust = get_customer(db, customer_id)
    if not cust:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return cust

# Update customer (allow only admin or role-based check)
@router.put("/{customer_id}", response_model=CustomerOut)
def api_update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    # Optionally enforce admin only:
    # if current.get("role") != "admin":
    #     raise HTTPException(status_code=403, detail="Not authorized")
    cust = update_customer(db, customer_id, full_name=payload.full_name, phone=payload.phone, address=payload.address)
    if not cust:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return cust

# Delete customer (admin-only recommended)
@router.delete("/{customer_id}", status_code=status.HTTP_200_OK)
def api_delete_customer(customer_id: int, db: Session = Depends(get_db), current=Depends(get_current_user)):
    # Require admin to delete:
    if current.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    ok = delete_customer(db, customer_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return {"detail": "Customer deleted"}

# created by: professor zabihullah burhani
# ICT and AI and Robotics متخصص
# phone: 0705002913, email: zabihullahburhani@gmail.com
# Address: Takhar University, Computer Science Faculty
