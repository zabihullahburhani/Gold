from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import csv
import logging
from datetime import datetime
from persiantools.jdatetime import JalaliDateTime  # 📅 برای تاریخ جلالی

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
    from reportlab.lib.units import mm
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
        raise HTTPException(status_code=404, detail="Customer not found")

    transactions = db.query(Transaction).filter(Transaction.customer_id == customer_id).all()
    if not transactions:
        raise HTTPException(status_code=404, detail="No transactions for this customer")

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # 🗓 تاریخ جلالی
    jalali_now = JalaliDateTime.now().strftime("%Y/%m/%d %H:%M")

    c.setFont("Vazir", 16)
    c.drawRightString(width - 20 * mm, height - 20 * mm, "بل رسمی تمام معاملات مشتری")
    c.setFont("Vazir", 12)
    c.drawRightString(width - 20 * mm, height - 40 * mm, f"مشتری: {customer.full_name}")
    c.drawRightString(width - 20 * mm, height - 50 * mm, f"تاریخ چاپ: {jalali_now}")

    y = height - 70 * mm
    y -= 10 * mm
    c.setFont("Vazir", 10)
    headers = "شماره | تاریخ | نوع معامله | خرید گرام | فروش گرام | پول فروش | پول خرید"
    c.drawRightString(width - 20 * mm, y, headers)
    y -= 5 * mm
    c.line(20 * mm, y, width - 20 * mm, y)
    y -= 5 * mm

    total_dollar_in = 0
    total_dollar_out = 0
    serial = 1

    for txn in transactions:
        txn_date = txn.date
        if isinstance(txn_date, datetime):
            txn_date = JalaliDateTime(txn_date).strftime("%Y/%m/%d")

        c.setFont("Vazir", 10)
        x_start = width - 20 * mm
        c.drawRightString(x_start - 0 * mm, y, str(serial))
        c.drawRightString(x_start - 20 * mm, y, str(txn_date))
        c.drawRightString(x_start - 40 * mm, y, "خرید" if txn.type == "buy" else "فروش")
        c.drawRightString(x_start - 60 * mm, y, str(round(txn.gold_in, 3)))
        c.drawRightString(x_start - 80 * mm, y, str(round(txn.gold_out, 3)))
        c.drawRightString(x_start - 100 * mm, y, str(round(txn.dollar_out, 2)))
        c.drawRightString(x_start - 120 * mm, y, str(round(txn.dollar_in, 2)))

        total_dollar_in += txn.dollar_in
        total_dollar_out += txn.dollar_out
        serial += 1

        y -= 10 * mm
        if y < 40 * mm:
            c.showPage()
            y = height - 40 * mm
            c.setFont("Vazir", 10)
            c.drawRightString(width - 20 * mm, y, headers)
            y -= 5 * mm
            c.line(20 * mm, y, width - 20 * mm, y)
            y -= 5 * mm

    c.setFont("Vazir", 12)
    y -= 10 * mm
    c.drawRightString(width - 20 * mm, y, f"مجموع پول فروش: {round(total_dollar_out, 2)}")
    y -= 8 * mm
    c.drawRightString(width - 20 * mm, y, f"مجموع پول خرید: {round(total_dollar_in, 2)}")

    y -= 15 * mm
    c.drawRightString(width - 20 * mm, y, "امضا / مهر دوکان:")
    c.save()
    buffer.seek(0)

    filename = f"invoice_customer_{customer_id}.pdf"
    return StreamingResponse(buffer, media_type="application/pdf",
                             headers={"Content-Disposition": f'attachment; filename=\"{filename}\"'})


# ✅ بل مشتری در فرمت CSV (اکسل)
@router.get("/invoices/customer/{customer_id}/excel")
@router.get("/invoices/customer/{customer_id}/xlsx")
def customer_invoice_csv(customer_id: int, db: Session = Depends(get_db)):
    try:
        from persiantools.jdatetime import JalaliDateTime

        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        transactions = db.query(Transaction).filter(Transaction.customer_id == customer_id).all()
        if not transactions:
            raise HTTPException(status_code=404, detail="No transactions for this customer")

        output = io.StringIO()
        writer = csv.writer(output, delimiter=',', quoting=csv.QUOTE_MINIMAL, lineterminator='\n')

        # 🗓 تاریخ جلالی
        jalali_now = JalaliDateTime.now().strftime("%Y/%m/%d %H:%M")

        writer.writerow(["بل رسمی تمام معاملات مشتری", ""])
        writer.writerow(["مشتری:", customer.full_name, "", "", "لوگوی دفتر"])
        writer.writerow(["کد مشتری:", customer.customer_id, "", "", "اسم دفتر پاسه فروشی غفاری"])
        writer.writerow(["تاریخ چاپ:", jalali_now, "", "", "آدرس کابل، حمید مارکیت منزل اول"])
        writer.writerow(["", "", "", "", "شماره تماس: 0706655884"])
        writer.writerow([])

        # 🧾 هدر جدول
        headers = ["شماره", "تاریخ (جلالی)", "نوع معامله", "خرید گرام", "فروش گرام", "پول فروش", "پول خرید"]
        writer.writerow(headers)

        # 🧮 متغیرهای جمع
        total_dollar_in = 0
        total_dollar_out = 0
        total_gold_in = 0
        total_gold_out = 0
        total_buy_count = 0
        total_sell_count = 0
        serial = 1

        for txn in transactions:
            txn_date = txn.date
            if isinstance(txn_date, datetime):
                txn_date = JalaliDateTime(txn_date).strftime("%Y/%m/%d")

            txn_type = "خرید" if txn.type == "buy" else "فروش"

            writer.writerow([
                serial,
                txn_date,
                txn_type,
                round(txn.gold_in, 3),
                round(txn.gold_out, 3),
                round(txn.dollar_out, 2),
                round(txn.dollar_in, 2)
            ])

            total_gold_in += txn.gold_in
            total_gold_out += txn.gold_out
            total_dollar_in += txn.dollar_in
            total_dollar_out += txn.dollar_out

            if txn.type == "buy":
                total_buy_count += 1
            else:
                total_sell_count += 1

            serial += 1

        writer.writerow([])

        # 🏁 جمع کل و امتیاز مشتری
        customer_score = round(
            (total_buy_count + total_sell_count) * 10
            + abs(total_dollar_out - total_dollar_in) / 10000
            + abs(total_gold_out - total_gold_in) / 10,
            2
        )

        writer.writerow([
            "امتیاز مشتری", "تعداد خرید", "تعداد فروش",
            "مجموع خرید گرام", "مجموع فروش گرام",
            "مجموع پول فروش", "مجموع پول خرید"
        ])

        writer.writerow([
            customer_score,
            total_buy_count,
            total_sell_count,
            round(total_gold_in, 3),
            round(total_gold_out, 3),
            round(total_dollar_out, 2),
            round(total_dollar_in, 2)
        ])

        writer.writerow([])
        writer.writerow(["امضا / مهر دفتر"])

        # 🧾 افزودن BOM برای پشتیبانی فارسی در اکسل
        output.seek(0)
        content = "\ufeff" + output.getvalue()
        buffer = io.BytesIO(content.encode('utf-8'))
        buffer.seek(0)

        filename = f"invoice_customer_{customer_id}_{JalaliDateTime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return StreamingResponse(
            buffer,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename=\"{filename}\"'}
        )
    except Exception as e:
        logger.error(f"خطا در تولید فایل CSV برای مشتری {customer_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطا در تولید فایل CSV: {str(e)}")
