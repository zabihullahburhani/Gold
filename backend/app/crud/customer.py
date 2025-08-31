from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate
from typing import List, Optional

def create_customer(db: Session, customer: CustomerCreate):
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def get_customer(db: Session, customer_id: int) -> Optional[Customer]:
    return db.query(Customer).filter(Customer.customer_id == customer_id).first()
# table with search
#def get_all_customers(db: Session) -> List[Customer]:
#    return db.query(Customer).all()


def get_all_customers(db: Session, search: str = None) -> List[Customer]:
    query = db.query(Customer)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Customer.full_name.ilike(search_pattern),
                Customer.phone.ilike(search_pattern),
                Customer.address.ilike(search_pattern),
            )
        )
    return query.all()


def update_customer(db: Session, customer_id: int, customer: CustomerUpdate) -> Optional[Customer]:
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
    for key, value in customer.dict(exclude_unset=True).items():
        setattr(db_customer, key, value)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int) -> bool:
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return False
    db.delete(db_customer)
    db.commit()
    return True