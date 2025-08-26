from sqlalchemy.orm import Session
from app.models.user import Employee, Login

def get_login_by_username(db: Session, username: str) -> Login | None:
    return db.query(Login).filter(Login.username == username).first()

def create_user(db: Session, *, username: str, password_hash: str, full_name: str, role: str = "user") -> Login:
    emp = Employee(full_name=full_name, role=role)
    db.add(emp)
    db.commit()
    db.refresh(emp)

    login = Login(employee_id=emp.employee_id, username=username, password_hash=password_hash)
    db.add(login)
    db.commit()
    db.refresh(login)
    return login

def list_users(db: Session) -> list[Login]:
    return db.query(Login).all()
