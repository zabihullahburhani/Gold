# path: backend/app/crud/customer.py
"""
CRUD helpers for Customer model.
All functions receive a SQLAlchemy Session.
"""
from sqlalchemy.orm import Session
from app.models.customer import Customer
from typing import List, Optional

def create_customer(db: Session, full_name: str, phone: Optional[str] = None, address: Optional[str] = None) -> Customer:
    cust = Customer(full_name=full_name, phone=phone, address=address)
    db.add(cust)
    db.commit()
    db.refresh(cust)
    return cust

def get_customer(db: Session, customer_id: int) -> Optional[Customer]:
    return db.get(Customer, customer_id)

def list_customers(db: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
    return db.query(Customer).offset(skip).limit(limit).all()

def update_customer(db: Session, customer_id: int, full_name: Optional[str] = None, phone: Optional[str] = None, address: Optional[str] = None) -> Optional[Customer]:
    cust = db.get(Customer, customer_id)
    if not cust:
        return None
    if full_name is not None:
        cust.full_name = full_name
    if phone is not None:
        cust.phone = phone
    if address is not None:
        cust.address = address
    db.add(cust)
    db.commit()
    db.refresh(cust)
    return cust

def delete_customer(db: Session, customer_id: int) -> bool:
    cust = db.get(Customer, customer_id)
    if not cust:
        return False
    db.delete(cust)
    db.commit()
    return True

# created by: professor zabihullah burhani
# ICT and AI and Robotics متخصص
# phone: 0705002913, email: zabihullahburhani@gmail.com
# Address: Takhar University, Computer Science Faculty
