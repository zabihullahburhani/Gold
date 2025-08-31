from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import require_admin
from app.schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate
from app.crud.customer import (
    create_customer,
    get_customer,
    get_all_customers,
    update_customer,
    delete_customer,
)

router = APIRouter(prefix="/customers", tags=["customers"])

@router.post("/", response_model=CustomerOut)
def create_new_customer(
    customer: CustomerCreate, db: Session = Depends(get_db), current=Depends(require_admin)
):
    return create_customer(db, customer)

@router.get("/", response_model=List[CustomerOut])
def get_customers(db: Session = Depends(get_db), current=Depends(require_admin)):
    customers = get_all_customers(db)
    return customers

@router.get("/{customer_id}", response_model=CustomerOut)
def get_single_customer(
    customer_id: int, db: Session = Depends(get_db), current=Depends(require_admin)
):
    customer = get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=CustomerOut)
def update_existing_customer(
    customer_id: int,
    customer: CustomerUpdate,
    db: Session = Depends(get_db),
    current=Depends(require_admin),
):
    updated_customer = update_customer(db, customer_id, customer)
    if not updated_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return updated_customer

@router.delete("/{customer_id}")
def delete_existing_customer(
    customer_id: int, db: Session = Depends(get_db), current=Depends(require_admin)
):
    if not delete_customer(db, customer_id):
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"detail": "Customer deleted successfully"}