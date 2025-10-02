from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.notification import Notification, NotificationCreate
from app.crud.notification import (
    create_notification,
      get_notifications, 
      mark_as_read, 
      delete_notification
)
from app.core.security import get_current_user


router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.post("/", response_model=Notification)
def create_new_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    return create_notification(db, notification)

@router.get("/", response_model=List[Notification])
def read_notifications(db: Session = Depends(get_db), employee_id: int = None):
    return get_notifications(db, employee_id)

@router.put("/{notif_id}/read", response_model=Notification)
def read_single_notification(notif_id: int, db: Session = Depends(get_db)):
    notif = mark_as_read(db, notif_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.delete("/{notif_id}")
def delete_single_notification(notif_id: int, db: Session = Depends(get_db)):
    deleted = delete_notification(db, notif_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted successfully"}
