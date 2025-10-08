from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime
import os
import logging

from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.customer import Customer

from pydrive2.auth import GoogleAuth
from pydrive2.drive import GoogleDrive

# تنظیم لاگ برای debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

EXPORT_DIR = os.path.join(os.path.dirname(__file__), "../../../exports")
os.makedirs(EXPORT_DIR, exist_ok=True)

# ---------- آپلود به گوگل درایو ----------
def upload_to_drive(file_path, folder_id):
    try:
        gauth = GoogleAuth()
        gauth.LoadClientConfigFile(os.path.join(os.path.dirname(__file__), "../../client_secrets.json"))
        gauth.LocalWebserverAuth()  # مرورگر باز می‌شود برای ورود
        drive = GoogleDrive(gauth)

        file_drive = drive.CreateFile({
            'title': os.path.basename(file_path),
            'parents': [{'id': folder_id}]
        })
        file_drive.SetContentFile(file_path)
        file_drive.Upload()
        return file_drive['title']
    except Exception as e:
        logger.error(f"خطا در آپلود به گوگل‌درایو: {str(e)}")
        raise HTTPException(status_code=500, detail=f"❌ خطا در آپلود گوگل‌درایو: {str(e)}")

# ---------- ایجاد بک‌آپ اکسل ----------
def create_excel_backup(db: Session):
    try:
        transactions = db.query(Transaction).all()
        if not transactions:
            raise HTTPException(status_code=404, detail="هیچ معامله‌ای یافت نشد")

        data = []
        for txn in transactions:
            date_str = txn.date.strftime("%Y-%m-%d") if isinstance(txn.date, datetime) else txn.date
            created_at_str = txn.created_at.strftime("%Y-%m-%d %H:%M:%S") if isinstance(txn.created_at, datetime) else txn.created_at
            data.append({
                "شناسه": txn.txn_id,
                "مشتری": txn.customer.full_name if txn.customer else "نامشخص",
                "نوع معامله": "خرید" if txn.type == "buy" else "فروش",
                "وزن (گرم)": round(float(txn.weight), 3),
                "عیار مبدا": round(float(txn.source_carat), 3),
                "نرخ توله": round(float(txn.gold_rate), 3),
                "مقدار طلا": round(float(txn.gold_amount), 3),
                "خرید (طلا)": round(float(txn.gold_in), 3),
                "پول خرید": round(float(txn.dollar_out), 3),
                "فروش (طلا)": round(float(txn.gold_out), 3),
                "پول فروش": round(float(txn.dollar_in), 3),
                "بیلانس دالر": round(float(txn.dollar_balance), 3),
                "بیلانس طلا": round(float(txn.gold_balance), 3),
                "توضیحات": txn.detail if txn.detail else "",
                "تاریخ": date_str,
                "زمان ایجاد": created_at_str,
            })

        df = pd.DataFrame(data)
        filename = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        filepath = os.path.join(EXPORT_DIR, filename)
        df.to_excel(filepath, index=False, engine='openpyxl')
        return filepath, filename
    except Exception as e:
        logger.error(f"خطا در ایجاد بک‌آپ اکسل: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطا در ایجاد فایل اکسل: {str(e)}")

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
    folder_id = "1dPWL6JdxhcjTV6eyuXy1ZsKje59E5FTb"  # پوشه گوگل‌درایو
    filepath, filename = create_excel_backup(db)
    uploaded_filename = upload_to_drive(filepath, folder_id)
    return {"message": f"✅ فایل {uploaded_filename} با موفقیت در گوگل‌درایو آپلود شد."}

# ---------- Import from Excel ----------
@router.post("/backup/import")
def import_transactions_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        df = pd.read_excel(file.file, engine='openpyxl')
    except Exception as e:
        logger.error(f"خطا در خواندن فایل اکسل: {str(e)}")
        raise HTTPException(status_code=400, detail=f"خطا در خواندن فایل اکسل: {str(e)}")

    required_columns = [
        "شناسه", "مشتری", "نوع معامله", "وزن (گرم)", "عیار مبدا", "نرخ توله",
        "مقدار طلا", "خرید (طلا)", "پول خرید", "فروش (طلا)", "پول فروش",
        "بیلانس دالر", "بیلانس طلا", "توضیحات", "تاریخ", "زمان ایجاد"
    ]
    if not all(col in df.columns for col in required_columns):
        missing_cols = [col for col in required_columns if col not in df.columns]
        logger.error(f"ستون‌های مورد نیاز یافت نشد: {missing_cols}")
        raise HTTPException(status_code=400, detail=f"فایل اکسل باید شامل ستون‌های زیر باشد: {', '.join(required_columns)}. ستون‌های مفقود: {', '.join(missing_cols)}")

    imported_count = 0
    skipped_count = 0

    for index, row in df.iterrows():
        try:
            # بررسی تکراری بودن تراکنش بر اساس txn_id
            txn_id = row.get("شناسه")
            if pd.isna(txn_id):
                logger.warning(f"ردیف {index + 2}: شناسه خالی است، نادیده گرفته شد")
                continue
            txn_id = int(txn_id)
            existing_txn = db.query(Transaction).filter(Transaction.txn_id == txn_id).first()
            if existing_txn:
                logger.info(f"ردیف {index + 2}: تراکنش با شناسه {txn_id} تکراری است، نادیده گرفته شد")
                skipped_count += 1
                continue

            # اعتبارسنجی مشتری
            customer_name = row.get("مشتری", "").strip()
            if not customer_name or customer_name == "نامشخص":
                logger.error(f"ردیف {index + 2}: نام مشتری نمی‌تواند خالی یا 'نامشخص' باشد")
                raise HTTPException(status_code=400, detail=f"ردیف {index + 2}: نام مشتری نمی‌تواند خالی یا 'نامشخص' باشد")

            customer = db.query(Customer).filter(Customer.full_name == customer_name).first()
            if not customer:
                logger.info(f"ایجاد مشتری جدید: {customer_name}")
                customer = Customer(full_name=customer_name)
                db.add(customer)
                db.commit()
                db.refresh(customer)

            # اعتبارسنجی داده‌ها
            transaction_type = "buy" if row.get("نوع معامله", "").strip() == "خرید" else "sell"
            if transaction_type not in ["buy", "sell"]:
                logger.error(f"ردیف {index + 2}: نوع معامله نامعتبر: {transaction_type}")
                raise ValueError(f"نوع معامله نامعتبر: {transaction_type}")

            weight = float(row.get("وزن (گرم)", 0.0))
            source_carat = float(row.get("عیار مبدا", 0.0))
            gold_rate = float(row.get("نرخ توله", 0.0))
            gold_amount = float(row.get("مقدار طلا", 0.0))
            gold_in = float(row.get("خرید (طلا)", 0.0))
            gold_out = float(row.get("فروش (طلا)", 0.0))
            dollar_in = float(row.get("پول فروش", 0.0))
            dollar_out = float(row.get("پول خرید", 0.0))
            dollar_balance = float(row.get("بیلانس دالر", 0.0))
            gold_balance = float(row.get("بیلانس طلا", 0.0))
            detail = row.get("توضیحات", "") if pd.notna(row.get("توضیحات")) else None
            date = pd.to_datetime(row.get("تاریخ"), errors='coerce')
            created_at = pd.to_datetime(row.get("زمان ایجاد"), errors='coerce')

            if pd.isna(date):
                logger.error(f"ردیف {index + 2}: تاریخ نامعتبر")
                raise ValueError("تاریخ نامعتبر")
            date_str = date.strftime("%Y-%m-%d")
            created_at_str = created_at.strftime("%Y-%m-%d %H:%M:%S") if pd.notna(created_at) else datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

            # ایجاد تراکنش
            txn = Transaction(
                txn_id=txn_id,
                customer_id=customer.customer_id,
                type=transaction_type,
                weight=round(weight, 3),
                source_carat=round(source_carat, 3),
                gold_rate=round(gold_rate, 3),
                gold_amount=round(gold_amount, 3),
                gold_in=round(gold_in, 3),
                gold_out=round(gold_out, 3),
                dollar_in=round(dollar_in, 3),
                dollar_out=round(dollar_out, 3),
                dollar_balance=round(dollar_balance, 3),
                gold_balance=round(gold_balance, 3),
                detail=detail,
                date=date_str,
                created_at=created_at_str
            )
            db.add(txn)
            imported_count += 1
            logger.info(f"ردیف {index + 2}: تراکنش با شناسه {txn_id} با موفقیت اضافه شد")

        except (ValueError, TypeError) as e:
            logger.error(f"ردیف {index + 2}: خطا در پردازش داده‌ها: {str(e)}")
            raise HTTPException(status_code=400, detail=f"ردیف {index + 2}: خطا در پردازش داده‌ها: {str(e)}")
        except Exception as e:
            logger.error(f"ردیف {index + 2}: خطای غیرمنتظره: {str(e)}")
            raise HTTPException(status_code=500, detail=f"ردیف {index + 2}: خطای غیرمنتظره: {str(e)}")

    try:
        db.commit()
        logger.info(f"ایمپورت موفقیت‌آمیز: {imported_count} تراکنش وارد شد، {skipped_count} تراکنش تکراری نادیده گرفته شد")
    except Exception as e:
        db.rollback()
        logger.error(f"خطا در ذخیره معاملات در دیتابیس: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطا در ذخیره معاملات در دیتابیس: {str(e)}")

    return {
        "message": f"✅ {imported_count} تراکنش با موفقیت وارد شدند. {skipped_count} تراکنش تکراری نادیده گرفته شدند."
    }