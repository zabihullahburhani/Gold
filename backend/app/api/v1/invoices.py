from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
from datetime import datetime
import csv # 🎯 جدید: برای کار با CSV

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import mm

from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.customer import Customer

router = APIRouter(tags=["invoices"])

# ثبت فونت فارسی
VAZIR_FONT_PATH = "static/fonts/vazir.ttf"
try:
    pdfmetrics.registerFont(TTFont("Vazir", VAZIR_FONT_PATH))
except:
    pass

# ✅ لیست مشتری‌ها برای کامبوباکس (بدون تغییر)
@router.get("/invoices/customers")
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    return [{"id": c.customer_id, "name": c.full_name} for c in customers]

# ---------------------------------------------------
# ✅ ۱. بل مشتری در فرمت PDF (بدون تغییر)
# ---------------------------------------------------
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

    c.setFont("Vazir", 16)
    c.drawRightString(width - 20*mm, height - 20*mm, "بل رسمی تمام معاملات مشتری")
    c.setFont("Vazir", 12)
    c.drawRightString(width - 20*mm, height - 40*mm, f"مشتری: {customer.full_name}")
    c.drawRightString(width - 20*mm, height - 50*mm, f"تاریخ چاپ: {datetime.now().strftime('%Y-%m-%d %H:%M')}")

    y = height - 70*mm
    # ساختن جدول PDF اینجا پیچیده است و با توجه به کد اصلی، فقط رشته‌ها رسم شده‌اند.
    # برای بل رسمی، بهتر است از منطق جدول‌بندی ReportLab استفاده شود، اما فعلاً فرمت اصلی حفظ می‌شود:
    
    # هدرها
    y -= 10*mm
    c.setFont("Vazir", 10)
    c.drawRightString(width - 20*mm, y, "تاریخ | نوع معامله | طلا ورودی | طلا خروجی | دالر ورودی | دالر خروجی")
    y -= 5*mm
    c.line(20*mm, y, width - 20*mm, y) # خط جداکننده
    y -= 5*mm
    
    for txn in transactions:
        c.setFont("Vazir", 11)
        # 🎯 برای نمایش بهتر در PDF، از چندینdrawString استفاده شده است:
        x_start = width - 20*mm
        # دالر خروج
        c.drawRightString(x_start - 0*mm, y, str(txn.dollar_out))
        # دالر ورود
        c.drawRightString(x_start - 30*mm, y, str(txn.dollar_in))
        # طلا خروج
        c.drawRightString(x_start - 60*mm, y, str(txn.gold_out))
        # طلا ورود
        c.drawRightString(x_start - 90*mm, y, str(txn.gold_in))
        # نوع
        c.drawRightString(x_start - 120*mm, y, str(txn.type))
        # تاریخ
        c.drawRightString(x_start - 150*mm, y, str(txn.date))

        y -= 10*mm
        if y < 40*mm:
            c.showPage()
            y = height - 40*mm
            # رسم هدر در صفحه جدید... (برای سادگی در اینجا حذف شده)


    c.setFont("Vazir", 12)
    c.drawRightString(width - 20*mm, 30*mm, "امضا / مهر دوکان:")
    c.save()
    buffer.seek(0)

    filename = f"invoice_customer_{customer_id}.pdf"
    return StreamingResponse(buffer, media_type="application/pdf",
                             headers={"Content-Disposition": f'attachment; filename="{filename}"'})


# ---------------------------------------------------
# ✅ ۲. بل مشتری در فرمت Excel (CSV) 🎯 جدید
# ---------------------------------------------------

@router.get("/invoices/customer/{customer_id}/excel")
def customer_invoice_excel(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    transactions = db.query(Transaction).filter(Transaction.customer_id == customer_id).all()
    if not transactions:
        raise HTTPException(status_code=404, detail="No transactions for this customer")

    output = io.StringIO()
    # 🎯 استفاده از جداکننده کاما (,) و نقل قول برای سازگاری بهتر با Excel
    writer = csv.writer(output, delimiter=',', quoting=csv.QUOTE_ALL) 

    # 1. اطلاعات هدر
    writer.writerow(["بل رسمی تمام معاملات مشتری"])
    writer.writerow([f"مشتری:", customer.full_name])
    writer.writerow([f"کد مشتری:", customer_id])
    writer.writerow([f"تاریخ چاپ:", datetime.now().strftime('%Y-%m-%d %H:%M')])
    writer.writerow([]) # خط خالی

    # 2. هدر جدول
    writer.writerow(["id", "تاریخ", "نوع معامله", "طلا ورودی (g)", "طلا خروجی (g)", "دالر ورودی ($)", "دالر خروجی ($)"])

    # 3. داده‌های معاملات
    for txn in transactions:
        writer.writerow([
            txn.txn_id,
            txn.date,
            txn.type,
            txn.gold_in,
            txn.gold_out,
            txn.dollar_in,
            txn.dollar_out
        ])
    
    # 4. ایجاد پاسخ StreamingResponse
    output.seek(0)
    # 🎯 اضافه کردن UTF-8 BOM برای خوانده شدن صحیح کاراکترهای فارسی در اکسل
    content = "\ufeff" + output.getvalue() 
    buffer = io.BytesIO(content.encode('utf-8'))
    buffer.seek(0)
    
    # 🎯 تنظیم نام فایل: invoice_customer_[id]_[today].csv
    today_str = datetime.now().strftime('%Y%m%d')
    filename = f"invoice_customer_{customer_id}_{today_str}.csv"

    return StreamingResponse(
        buffer, 
        media_type="text/csv", 
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )