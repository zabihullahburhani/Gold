# backend/app/api/v1/backup.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime
import os

from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.customer import Customer

from pydrive2.auth import GoogleAuth
from pydrive2.drive import GoogleDrive

router = APIRouter()

EXPORT_DIR = os.path.join(os.path.dirname(__file__), "../../../exports")
os.makedirs(EXPORT_DIR, exist_ok=True)

# ---------- آپلود به گوگل درایو ----------
def upload_to_drive(file_path, folder_id):
    gauth = GoogleAuth()
    gauth.LoadClientConfigFile(os.path.join(os.path.dirname(__file__), "../../client_secrets.json"))
    gauth.LocalWebserverAuth()  # مرورگر باز میشه برای ورود
    drive = GoogleDrive(gauth)

    file_drive = drive.CreateFile({
        'title': os.path.basename(file_path),
        'parents': [{'id': folder_id}]
    })
    file_drive.SetContentFile(file_path)
    file_drive.Upload()
    return file_drive['title']


# ---------- ایجاد بک‌آپ اکسل ----------
def create_excel_backup(db: Session):
    transactions = db.query(Transaction).all()
    if not transactions:
        raise HTTPException(status_code=404, detail="هیچ معامله‌ای یافت نشد")

    data = []
    for txn in transactions:
        date_str = txn.date.strftime("%Y-%m-%d") if isinstance(txn.date, datetime) else txn.date
        data.append({
            "شناسه": txn.txn_id,
            "مشتری": txn.customer.full_name if txn.customer else "",
            "نوع معامله": txn.type,
            "طلا ورود": txn.gold_in,
            "طلا خروج": txn.gold_out,
            "دالر ورود": txn.dollar_in,
            "دالر خروج": txn.dollar_out,
            "تاریخ": date_str,
        })

    df = pd.DataFrame(data)
    filename = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    filepath = os.path.join(EXPORT_DIR, filename)
    df.to_excel(filepath, index=False)
    return filepath, filename


# ---------- Export Endpoint ----------
@router.get("/backup/export")
def export_transactions_excel(db: Session = Depends(get_db)):
    filepath, filename = create_excel_backup(db)
    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


# ---------- Upload to Google Drive Endpoint ----------
@router.post("/backup/upload_drive")
def upload_backup_to_drive(db: Session = Depends(get_db)):
    folder_id = "1dPWL6JdxhcjTV6eyuXy1ZsKje59E5FTb"  # 👈 پوشه گوگل‌درایو
    filepath, filename = create_excel_backup(db)
    try:
        uploaded_filename = upload_to_drive(filepath, folder_id)
        return {"message": f"✅ فایل {uploaded_filename} با موفقیت در گوگل‌درایو آپلود شد."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ خطا در آپلود گوگل‌درایو: {e}")


# ---------- Import from Excel ----------
@router.post("/backup/import")
def import_transactions_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        df = pd.read_excel(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"خطا در خواندن فایل اکسل: {e}")

    for _, row in df.iterrows():
        customer_name = row.get("مشتری", "")
        customer = None
        if customer_name:
            customer = db.query(Customer).filter(Customer.full_name == customer_name).first()
            if not customer:
                customer = Customer(full_name=customer_name)
                db.add(customer)
                db.commit()
                db.refresh(customer)

        txn = Transaction(
            customer_id=customer.customer_id if customer else None,
            gold_type_id=1,  # 👈 مقدار پیش‌فرض چون در اکسل نداریم
            type=row.get("نوع معامله", ""),
            gold_in=row.get("طلا ورود", 0.0),
            gold_out=row.get("طلا خروج", 0.0),
            dollar_in=row.get("دالر ورود", 0.0),
            dollar_out=row.get("دالر خروج", 0.0),
            date=row.get("تاریخ") if pd.notna(row.get("تاریخ")) else None,
            detail=None
        )
        db.add(txn)

    db.commit()
    return {"message": "✅ معاملات با موفقیت از فایل اکسل وارد شدند."}
