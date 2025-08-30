# backend/app/api/v1/customers.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate
from app.crud import customer as crud_customer
from app.core.database import get_db

router = APIRouter(prefix="/customers", tags=["customers"])

@router.post("/", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_new_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):
    """
    مسیر برای ایجاد یک مشتری جدید.
    """
    db_customer = crud_customer.get_customer_by_phone(db, phone=customer.phone)
    if db_customer:
        raise HTTPException(
            status_code=400,
            detail="A customer with this phone number already exists."
        )
    return crud_customer.create_customer(db=db, customer=customer)

@router.get("/", response_model=List[CustomerOut])
def get_all_customers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    مسیر برای دریافت لیست تمام مشتریان.
    """
    customers = crud_customer.get_customers(db, skip=skip, limit=limit)
    return customers

@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer_by_id(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """
    مسیر برای دریافت اطلاعات یک مشتری بر اساس ID.
    """
    db_customer = crud_customer.get_customer_by_id(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )
    return db_customer

@router.put("/{customer_id}", response_model=CustomerOut)
def update_existing_customer(
    customer_id: int,
    customer_data: CustomerUpdate,
    db: Session = Depends(get_db)
):
    """
    مسیر برای به‌روزرسانی اطلاعات یک مشتری.
    """
    db_customer = crud_customer.get_customer_by_id(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )
    return crud_customer.update_customer(db=db, customer=db_customer, customer_in=customer_data)

@router.delete("/{customer_id}", response_model=CustomerOut)
def delete_existing_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """
    مسیر برای حذف یک مشتری.
    """
    db_customer = crud_customer.get_customer_by_id(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )
    return crud_customer.delete_customer(db=db, customer=db_customer)
