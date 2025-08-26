from pydantic import BaseModel

# --- Auth ---
class LoginIn(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

# --- Users ---
class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str

class UserOut(BaseModel):
    employee_id: int
    username: str
    full_name: str
    role: str

    class Config:
        from_attributes = True
