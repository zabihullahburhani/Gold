# backend/app/api/v1/activations.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.activation import ActivationRequest, ActivationOut, ActivationCodeValidation, ActivationStatusOut
from app.crud import activation as crud

router = APIRouter(prefix="/activations", tags=["activations"])

@router.post("/request", response_model=ActivationOut, status_code=status.HTTP_201_CREATED)
def request_activation(request: ActivationRequest, db: Session = Depends(get_db)):
    try:
        return crud.create_activation_request(db, request)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/validate", response_model=ActivationOut)
def validate_activation(validation: ActivationCodeValidation, db: Session = Depends(get_db)):
    rec, msg = crud.validate_activation_code(db, validation)
    if rec:
        return rec
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

@router.get("/status/{motherboard_code}", response_model=ActivationStatusOut)
def status(motherboard_code: str, db: Session = Depends(get_db)):
    return crud.get_activation_status(db, motherboard_code)

# Admin helper (protected by auth in real app) — set code for a hardware record
@router.post("/admin-set-code/{motherboard_code}", response_model=ActivationOut)
def admin_set_code(motherboard_code: str, activation_code: str, db: Session = Depends(get_db)):
    rec = crud.admin_set_code(db, motherboard_code, activation_code)
    if not rec:
        raise HTTPException(status_code=404, detail="رکورد پیدا نشد.")
    return rec
