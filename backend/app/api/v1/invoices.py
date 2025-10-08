
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
from datetime import datetime
import csv
import logging

from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.customer import Customer

# تنظیم لاگ برای debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["invoices"])

# ثبت فونت فارسی برای PDF (در صورت نیاز)
VAZIR_FONT_PATH = "static/fonts/vazir.ttf"
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    pdfmetrics.registerFont(TTFont("Vazir", VAZIR_FONT_PATH))
except Exception as e:
    logger.warning(f"خطا در بارگذاری فونت Vazir برای PDF: {str(e)}")

# ✅ لیست مشتری‌ها برای کامبوباکس
@router.get("/invoices/customers")
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    return [{"id": c.customer_id, "name": c.full_name} for c in customers]

# ✅ بل مشتری در فرمت PDF
@router.get("/invoices/customer/{customer_id}")
def customer_invoice(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        logger.error(f"مشتری با کد {customer_id} یافت نشد")
        raise HTTPException(status_code=404, detail="Customer not found")

    transactions = db.query(Transaction).filter(Transaction.customer_id == customer_id).all()
    if not transactions:
        logger.error(f"هیچ تراکنشی برای مشتری با کد {customer_id} یافت نشد")
        raise HTTPException(status_code=404, detail="No transactions for this customer")

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    c.setFont("Vazir", 16)
    c.drawRightString(width - 20*mm, height - 20*mm, "بل رسمی تمام معاملات مشتری")
    c.setFont("Vazir", 12)
    c.drawRightString(width - 20*mm, height - 40*mm, f"مشتری: {customer.full_name}")
    c.drawRightString(width - 20*mm, height - 50*mm, f"تاریخ چاپ: {datetime.now().strftime('%Y-%m-%d %H:%M')}")

    y = height - 70*mm
    y -= 10*mm
    c.setFont("Vazir", 10)
    headers = "شناسه | تاریخ | نوع معامله | خرید گرام | فروش گرام | پول فروش | پول خرید"
    c.drawRightString(width - 20*mm, y, headers)
    y -= 5*mm
    c.line(20*mm, y, width - 20*mm, y)
    y -= 5*mm

    for txn in transactions:
        c.setFont("Vazir", 10)
        x_start = width - 20*mm
        c.drawRightString(x_start - 0*mm, y, str(txn.txn_id))
        c.drawRightString(x_start - 20*mm, y, str(txn.date.strftime("%m/%d/%Y") if isinstance(txn.date, datetime) else txn.date))
        c.drawRightString(x_start - 40*mm, y, "خرید" if txn.type == "buy" else "فروش")
        c.drawRightString(x_start - 60*mm, y, str(round(txn.gold_in, 8)))
        c.drawRightString(x_start - 80*mm, y, str(round(txn.gold_out, 8)))
        c.drawRightString(x_start - 100*mm, y, str(round(txn.dollar_out, 8)))
        c.drawRightString(x_start - 120*mm, y, str(round(txn.dollar_in, 8)))
        y -= 10*mm
        if y < 40*mm:
            c.showPage()
            y = height - 40*mm
            c.setFont("Vazir", 10)
            c.drawRightString(width - 20*mm, y, headers)
            y -= 5*mm
            c.line(20*mm, y, width - 20*mm, y)
            y -= 5*mm

    c.setFont("Vazir", 12)
    c.drawRightString(width - 20*mm, 30*mm, "امضا / مهر دوکان:")
    c.save()
    buffer.seek(0)

    filename = f"invoice_customer_{customer_id}.pdf"
    return StreamingResponse(buffer, media_type="application/pdf",
                            headers={"Content-Disposition": f'attachment; filename="{filename}"'})

# ✅ بل مشتری در فرمت CSV
@router.get("/invoices/customer/{customer_id}/excel")
@router.get("/invoices/customer/{customer_id}/xlsx")
def customer_invoice_csv(customer_id: int, db: Session = Depends(get_db)):
    try:
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if not customer:
            logger.error(f"مشتری با کد {customer_id} یافت نشد")
            raise HTTPException(status_code=404, detail="Customer not found")

        transactions = db.query(Transaction).filter(Transaction.customer_id == customer_id).all()
        if not transactions:
            logger.error(f"هیچ تراکنشی برای مشتری با کد {customer_id} یافت نشد")
            raise HTTPException(status_code=404, detail="No transactions for this customer")

        output = io.StringIO()
        writer = csv.writer(output, delimiter=',', quoting=csv.QUOTE_MINIMAL, lineterminator='\n')

        # 1️⃣ اطلاعات هدر
        writer.writerow(["بل رسمی تمام معاملات مشتری", ""])
        writer.writerow(["مشتری:", customer.full_name, "", "", "گولوی دفتر"])
        writer.writerow(["کد مشتری:", customer.customer_id, "", "", "اسم دفتر پاسه فروشی غفاری"])
        writer.writerow(["تاریخ چاپ:", datetime.now().strftime("%m/%d/%Y %H:%M"), "", "", "آدرس کابل، حمید مارکیت منزل اول"])
        writer.writerow(["", "", "", "", "شماره تماس: 0706655884"])
        writer.writerow([])

        # 2️⃣ هدر جدول معاملات
        headers = ["id", "تاریخ", "نوع معامله", "خرید گرام", "فروش گرام", "پول فروش", "پول خرید"]
        writer.writerow(headers)

        # 3️⃣ داده‌های معاملات
        total_buy_count = 0
        total_sell_count = 0
        total_gold_in = 0
        total_gold_out = 0
        total_dollar_in = 0
        total_dollar_out = 0

        for txn in transactions:
            writer.writerow([
                txn.txn_id,
                txn.date.strftime("%m/%d/%Y") if isinstance(txn.date, datetime) else txn.date,
                "خرید" if txn.type == "buy" else "فروش",
                round(txn.gold_in, 8),
                round(txn.gold_out, 8),
                round(txn.dollar_out, 8),  # پول فروش
                round(txn.dollar_in, 8)   # پول خرید
            ])

            if txn.type == "buy":
                total_buy_count += 1
                total_gold_in += txn.gold_in
                total_dollar_in += txn.dollar_in
            else:
                total_sell_count += 1
                total_gold_out += txn.gold_out
                total_dollar_out += txn.dollar_out

        writer.writerow([])

        # 4️⃣ جمع‌بندی / امتیاز مشتری
        writer.writerow(["امتیاز مشتری", "تعداد خرید", "تعداد فروش", "مجموع خرید گرام", "مجموع فروش گرام", "مجموع پول فروش", "مجموع پول خرید"])
        writer.writerow([
            round((total_buy_count + total_sell_count)*10 + abs(total_dollar_out-total_dollar_in)/10000 + abs(total_gold_out-total_gold_in)/10, 8),
            total_buy_count,
            total_sell_count,
            round(total_gold_in, 8),
            round(total_gold_out, 8),
            round(total_dollar_out, 8),
            round(total_dollar_in, 8)
        ])
        writer.writerow([])
        writer.writerow(["امضا یا مهر دفتر"])

        # 5️⃣ آماده‌سازی برای دانلود
        output.seek(0)
        content = "\ufeff" + output.getvalue()  # اضافه کردن UTF-8 BOM برای پشتیبانی از فارسی
        buffer = io.BytesIO(content.encode('utf-8'))
        buffer.seek(0)

        filename = f"invoice_customer_{customer_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return StreamingResponse(
            buffer,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        logger.error(f"خطا در تولید فایل CSV برای مشتری {customer_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطا در تولید فایل CSV: {str(e)}")
