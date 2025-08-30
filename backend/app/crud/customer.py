# backend/app/crud/customer.py

from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate

def get_customer_by_id(db: Session, customer_id: int) -> Optional[Customer]:
    """
    مشتری را بر اساس customer_id پیدا می‌کند.
    """
    return db.query(Customer).filter(Customer.customer_id == customer_id).first()

def get_customer_by_phone(db: Session, phone: str) -> Optional[Customer]:
    """
    مشتری را بر اساس شماره تلفن پیدا می‌کند.
    """
    return db.query(Customer).filter(Customer.phone == phone).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
    """
    لیستی از تمام مشتریان را از دیتابیس برمی‌گرداند.
    """
    return db.query(Customer).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: CustomerCreate) -> Customer:
    """
    یک مشتری جدید در دیتابیس ایجاد می‌کند.
    """
    db_customer = Customer(
        full_name=customer.full_name,
        phone=customer.phone,
        address=customer.address,
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def update_customer(db: Session, customer: Customer, customer_in: CustomerUpdate) -> Customer:
    """
    اطلاعات یک مشتری موجود را به‌روزرسانی می‌کند.
    """
    update_data = customer_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(customer, key, value)
    
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

def delete_customer(db: Session, customer: Customer) -> Customer:
    """
    یک مشتری را از دیتابیس حذف می‌کند.
    """
    db.delete(customer)
    db.commit()
    return customer
