from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

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
from app.models.customer import Customer  # 👈 اضافه شد

router = APIRouter(prefix="/customers", tags=["customers"])

@router.post("/", response_model=CustomerOut)
def create_new_customer(
    customer: CustomerCreate, db: Session = Depends(get_db), current=Depends(require_admin)
):
    return create_customer(db, customer)


# ✅ جستجو بر اساس نام
@router.get("/", response_model=List[CustomerOut])
def get_customers(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current=Depends(require_admin),
):
    query = db.query(Customer)
    if search:
        query = query.filter(Customer.full_name.ilike(f"%{search}%"))
    return query.all()


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
