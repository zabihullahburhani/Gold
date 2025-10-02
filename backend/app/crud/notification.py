from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate

def create_notification(db: Session, notification: NotificationCreate):
    db_notif = Notification(
        employee_id=notification.employee_id,
        title=notification.title,
        message=notification.message,
    )
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

def get_notifications(db: Session, employee_id: int = None):
    query = db.query(Notification)
    if employee_id:
        query = query.filter(Notification.employee_id == employee_id)
    return query.order_by(Notification.created_at.desc()).all()

def mark_as_read(db: Session, notif_id: int):
    notif = db.query(Notification).filter(Notification.notification_id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
        db.refresh(notif)
    return notif

def delete_notification(db: Session, notif_id: int):
    notif = db.query(Notification).filter(Notification.notification_id == notif_id).first()
    if notif:
        db.delete(notif)
        db.commit()
        return True
    return False
