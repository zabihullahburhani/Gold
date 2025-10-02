# backend/app/api/v1/reports.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.transaction import Transaction
from app.models.debt import Debt
from app.models.shop_expense import ShopExpense
from app.models.gold_rate import GoldRate
from app.models.customer import Customer

# reportlab
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import mm

router = APIRouter(tags=["reports"])

# مسیر فونت (مطمئن شو این مسیر درست است)
VAZIR_FONT_PATH = "static/fonts/vazir.ttf"

try:
    pdfmetrics.registerFont(TTFont("Vazir", VAZIR_FONT_PATH))
except Exception as e:
    print("Warning: failed to register Vazir font:", e)


def _draw_header(c: canvas.Canvas, title: str):
    c.setFont("Vazir", 16)
    c.drawCentredString(A4[0] / 2, A4[1] - 25 * mm, title)
    c.setFont("Vazir", 10)
    now = datetime.utcnow().astimezone().strftime("%Y-%m-%d %H:%M:%S")
    c.drawRightString(A4[0] - 15 * mm, A4[1] - 30 * mm, f"تولید‌شده: {now}")


def _draw_table(c: canvas.Canvas, x, y_top, col_widths, headers, rows, font_size=10, row_height=7 * mm):
    x0 = x
    y = y_top
    c.setFont("Vazir", font_size)
    # هدر
    c.setFillColorRGB(0.95, 0.95, 0.95)
    c.rect(x0, y - row_height, sum(col_widths), row_height, fill=1, stroke=0)
    c.setFillColorRGB(0, 0, 0)
    cx = x0
    for i, h in enumerate(headers):
        c.drawString(cx + 2 * mm, y - row_height + 2 * mm, str(h))
        cx += col_widths[i]
    y = y - row_height
    # بدنه
    for row in rows:
        if y < 30 * mm:
            c.showPage()
            _draw_header(c, "گزارش جامع — ادامه")
            y = A4[1] - 40 * mm
            c.setFont("Vazir", font_size)
        cx = x0
        for i, cell in enumerate(row):
            c.drawString(cx + 2 * mm, y - row_height + 2 * mm, str(cell))
            cx += col_widths[i]
        y = y - row_height
    return y


@router.get("/reports/full")
def full_report(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """
    گزارش جامع (PDF) از: customers, transactions, debts, shop_expenses, gold_rates
    """
    try:
        customers = db.query(Customer).order_by(Customer.customer_id).all()
        transactions = db.query(Transaction).order_by(Transaction.txn_id.desc()).limit(1000).all()
        debts = db.query(Debt).order_by(Debt.debt_id.desc()).limit(1000).all()
        expenses = db.query(ShopExpense).order_by(ShopExpense.expense_id.desc()).limit(1000).all()
        rates = db.query(GoldRate).order_by(GoldRate.rate_id.desc()).limit(100).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB query failed: {e}")

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    _draw_header(c, "GJBMS Public Reports")

    y = height - 40 * mm
    # مشتریان
    headers = ["کد", "نام", "شماره", "آدرس", "ثبت شده"]
    rows = []
    for cu in customers:
        rows.append([
            cu.customer_id,
            cu.full_name,
            cu.phone or "-",
            cu.address or "-",
            cu.created_at.strftime("%Y-%m-%d") if cu.created_at else "-"
        ])
    y = _draw_table(c, 15 * mm, y, [20 * mm, 60 * mm, 35 * mm, 50 * mm, 30 * mm], headers, rows, font_size=9, row_height=8 * mm)

    # معاملات (بدون کارمند)
    c.showPage()
    _draw_header(c, "گزارش جامع سیستم Gold — معاملات")
    y = height - 40 * mm
    headers = ["id", "مشتری", "نوع", "گرم_in", "گرم_out", "دالر_in", "دالر_out", "تاریخ"]
    rows = []
    for t in transactions:
        cust_name = t.customer.full_name if getattr(t, "customer", None) else t.customer_id
        rows.append([
            t.txn_id,
            cust_name,
            getattr(t, "type", "-"),
            getattr(t, "gold_in", 0),
            getattr(t, "gold_out", 0),
            getattr(t, "dollar_in", 0),
            getattr(t, "dollar_out", 0),
            getattr(t, "date", "-")
        ])
    y = _draw_table(c, 12 * mm, y, [12 * mm, 45 * mm, 20 * mm, 22 * mm, 22 * mm, 25 * mm, 25 * mm, 30 * mm], headers, rows, font_size=8, row_height=7 * mm)

    # بدهی‌ها
    c.showPage()
    _draw_header(c, "گزارش بدهی‌ها و مصارف دوکان")
    y = height - 40 * mm
    headers = ["id", "مشتری", "کارمند", "گرام", "توله", "دالر", "افغانی", "وضعیت", "تاریخ"]
    rows = []
    for d in debts:
        cust_name = d.customer.full_name if getattr(d, "customer", None) else d.customer_id
        emp_name = d.employee.full_name if getattr(d, "employee", None) else d.employee_id
        rows.append([d.debt_id, cust_name, emp_name, d.gold_grams, d.tola, d.usd, d.afn, "پرداخت" if d.is_paid else "در انتظار", d.created_at.strftime("%Y-%m-%d")])
    y = _draw_table(c, 12 * mm, y, [12 * mm, 40 * mm, 40 * mm, 20 * mm, 20 * mm, 22 * mm, 22 * mm, 25 * mm, 30 * mm], headers, rows, font_size=8, row_height=7 * mm)

    # مصارف دوکان
    c.showPage()
    _draw_header(c, "مصارف دوکان")
    y = height - 40 * mm
    headers = ["id", "نوع", "مبلغ (AFN)", "تاریخ", "کارمند", "توضیحات"]
    rows = []
    for ex in expenses:
        emp_name = ex.employee.full_name if getattr(ex, "employee", None) else ex.employee_id
        rows.append([ex.expense_id, ex.expense_type, ex.amount, ex.expense_date.strftime("%Y-%m-%d") if ex.expense_date else "-", emp_name, ex.description or "-"])
    y = _draw_table(c, 12 * mm, y, [12 * mm, 40 * mm, 30 * mm, 30 * mm, 40 * mm, 60 * mm], headers, rows, font_size=8, row_height=7 * mm)

    # نرخ‌ها
    c.showPage()
    _draw_header(c, "نرخ و اختلاف قیمت طلا")
    y = height - 40 * mm
    headers = ["id", "نرخ پایه USD", "اختلاف USD", "نرخ پایه AFN", "اختلاف AFN", "تاریخ"]
    rows = []
    for r in rates:
        rows.append([r.rate_id, getattr(r, "rate_per_gram_usd", 0), getattr(r, "difference_per_gram_usd", 0), getattr(r, "rate_per_gram_afn", 0), getattr(r, "difference_per_gram_afn", 0), r.created_at.strftime("%Y-%m-%d") if getattr(r, "created_at", None) else "-"])
    y = _draw_table(c, 12 * mm, y, [12 * mm, 35 * mm, 30 * mm, 35 * mm, 30 * mm, 35 * mm], headers, rows, font_size=8, row_height=7 * mm)

    c.save()
    buffer.seek(0)
    filename = f"gold_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})
