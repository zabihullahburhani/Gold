from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin, hash_password
from app.crud.user import create_user, list_users
from app.schemas.user import UserCreate, UserOut

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserOut, dependencies=[Depends(require_admin)])
def create_new_user(payload: UserCreate, db: Session = Depends(get_db)):
    login = create_user(
        db,
        username=payload.username,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role="user"
    )
    return {
        "employee_id": login.employee_id,
        "username": login.username,
        "full_name": login.employee.full_name,
        "role": login.employee.role,
    }

@router.get("/", response_model=list[UserOut], dependencies=[Depends(require_admin)])
def get_users(db: Session = Depends(get_db)):
    rows = list_users(db)
    return [
        {
            "employee_id": r.employee_id,
            "username": r.username,
            "full_name": r.employee.full_name,
            "role": r.employee.role,
        } for r in rows
    ]
