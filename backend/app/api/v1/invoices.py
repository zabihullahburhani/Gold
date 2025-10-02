from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
from datetime import datetime

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

# ✅ لیست مشتری‌ها برای کامبوباکس
@router.get("/invoices/customers")
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    return [{"id": c.customer_id, "name": c.full_name} for c in customers]

# ✅ چاپ بل مشتری خاص
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
    for txn in transactions:
        c.setFont("Vazir", 11)
        c.drawRightString(
            width - 20*mm,
            y,
            f"تاریخ: {txn.date} | نوع معامله: {txn.type} | طلا ورود: {txn.gold_in} | طلا خروج: {txn.gold_out} | دالر ورود: {txn.dollar_in} | دالر خروج: {txn.dollar_out}"
        )
        y -= 10*mm
        if y < 40*mm:
            c.showPage()
            y = height - 40*mm

    c.setFont("Vazir", 12)
    c.drawRightString(width - 20*mm, 30*mm, "امضا / مهر دوکان:")
    c.save()
    buffer.seek(0)

    filename = f"invoice_customer_{customer_id}.pdf"
    return StreamingResponse(buffer, media_type="application/pdf",
                             headers={"Content-Disposition": f'attachment; filename="{filename}"'})
