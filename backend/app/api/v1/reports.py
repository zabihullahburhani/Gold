
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
from datetime import datetime
import csv
import logging
from dateutil.parser import parse  # برای تبدیل رشته‌های تاریخ به datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.transaction import Transaction
from app.models.capital import Capital
from app.models.gold_analysis import GoldAnalysis
from app.models.customer import Customer
from app.models.gold_ledger import GoldLedger
from app.models.money_ledger import MoneyLedger

# تنظیم لاگ برای debugging
logging.basicConfig(level=logging.DEBUG, filename='app.log', filemode='a', format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter(tags=["reports"])

# تابع کمکی برای فرمت کردن تاریخ‌ها
def format_date(date_obj, default="-"):
    try:
        if isinstance(date_obj, str):
            # اگر تاریخ رشته است، آن را به datetime تبدیل کرده و فرمت می‌کنیم
            parsed_date = parse(date_obj)
            return parsed_date.strftime("%m/%d/%Y")
        elif hasattr(date_obj, 'strftime'):
            # اگر تاریخ شیء datetime است
            return date_obj.strftime("%m/%d/%Y")
        else:
            return default
    except (ValueError, TypeError) as e:
        logger.warning(f"خطا در فرمت کردن تاریخ: {str(e)}، مقدار: {date_obj}")
        return default

# تابع کمکی برای فرمت کردن تاریخ و زمان
def format_datetime(datetime_obj, default="-"):
    try:
        if isinstance(datetime_obj, str):
            parsed_datetime = parse(datetime_obj)
            return parsed_datetime.strftime("%m/%d/%Y %H:%M:%S")
        elif hasattr(datetime_obj, 'strftime'):
            return datetime_obj.strftime("%m/%d/%Y %H:%M:%S")
        else:
            return default
    except (ValueError, TypeError) as e:
        logger.warning(f"خطا در فرمت کردن تاریخ و زمان: {str(e)}، مقدار: {datetime_obj}")
        return default

# مسیر جدید: گزارش جامع به فرمت CSV
@router.get("/reports/full/excel")
def full_report_excel(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """
    گزارش جامع (CSV) شامل مشتریان، معاملات، سرمایه، تحلیل طلا، دفتر طلا، و دفتر پول
    """
    SHOP_NAME = "پاسه فروشی غفاری"
    REPORT_TITLE = "گزارش جامع سیستم Gold"

    try:
        customers = db.query(Customer).order_by(Customer.customer_id).all()
        transactions = db.query(Transaction).order_by(Transaction.txn_id.desc()).limit(1000).all()
        capitals = db.query(Capital).order_by(Capital.id.desc()).limit(1000).all()
        gold_analyses = db.query(GoldAnalysis).order_by(GoldAnalysis.id.desc()).limit(1000).all()
        gold_ledgers = db.query(GoldLedger).order_by(GoldLedger.gold_ledger_id.desc()).limit(1000).all()
        money_ledgers = db.query(MoneyLedger).order_by(MoneyLedger.money_ledger_id.desc()).limit(1000).all()
    except Exception as e:
        logger.error(f"خطا در کوئری دیتابیس: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطا در کوئری دیتابیس: {str(e)}")

    output = io.StringIO()
    writer = csv.writer(output, delimiter=',', quoting=csv.QUOTE_MINIMAL, lineterminator='\n')

    # 1. اطلاعات هدر
    writer.writerow([SHOP_NAME])
    writer.writerow([REPORT_TITLE])
    writer.writerow([f"تاریخ تولید: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}"])
    writer.writerow([])

    # 2. بخش مشتریان
    writer.writerow(["گزارش مشتریان"])
    writer.writerow(["کد", "نام", "شماره", "آدرس", "تاریخ ثبت"])
    for cu in customers:
        writer.writerow([
            cu.customer_id,
            cu.full_name,
            cu.phone or "-",
            cu.address or "-",
            format_date(cu.created_at)
        ])
    writer.writerow([])

    # 3. بخش معاملات
    writer.writerow(["گزارش معاملات"])
    writer.writerow(["id", "مشتری", "نوع", "خرید گرام", "فروش گرام", "پول خرید", "پول فروش", "تاریخ"])
    total_gold_in = 0
    total_gold_out = 0
    total_dollar_in = 0
    total_dollar_out = 0
    total_buy_count = 0
    total_sell_count = 0

    for t in transactions:
        cust_name = t.customer.full_name if getattr(t, "customer", None) and t.customer else t.customer_id
        writer.writerow([
            t.txn_id,
            cust_name,
            "خرید" if t.type == "buy" else "فروش",
            round(t.gold_in, 8),
            round(t.gold_out, 8),
            round(t.dollar_in, 8),  # پول خرید
            round(t.dollar_out, 8),  # پول فروش
            format_date(t.date)
        ])
        if t.type == "buy":
            total_buy_count += 1
            total_gold_in += t.gold_in
            total_dollar_in += t.dollar_in
        else:
            total_sell_count += 1
            total_gold_out += t.gold_out
            total_dollar_out += t.dollar_out

    writer.writerow(["جمع‌بندی معاملات"])
    writer.writerow(["تعداد خرید", "تعداد فروش", "مجموع خرید گرام", "مجموع فروش گرام", "مجموع پول خرید", "مجموع پول فروش"])
    writer.writerow([
        total_buy_count,
        total_sell_count,
        round(total_gold_in, 8),
        round(total_gold_out, 8),
        round(total_dollar_in, 8),
        round(total_dollar_out, 8)
    ])
    writer.writerow([])

    # 4. بخش سرمایه
    writer.writerow(["گزارش سرمایه"])
    writer.writerow(["id", "سرمایه دالر", "سرمایه طلا", "تاریخ"])
    total_usd_capital = 0
    total_gold_capital = 0
    for cap in capitals:
        writer.writerow([
            cap.id,
            round(cap.usd_capital, 8),
            round(cap.gold_capital, 8),
            format_date(cap.date)
        ])
        total_usd_capital += cap.usd_capital
        total_gold_capital += cap.gold_capital

    writer.writerow(["جمع‌بندی سرمایه"])
    writer.writerow(["مجموع سرمایه دالر", "مجموع سرمایه طلا"])
    writer.writerow([round(total_usd_capital, 8), round(total_gold_capital, 8)])
    writer.writerow([])

    # 5. بخش تحلیل طلا
    writer.writerow(["گزارش تحلیل طلا"])
    writer.writerow(["id", "وزن ناخالص", "عیار اولیه", "نرخ توله", "وزن نهایی", "نرخ دالر", "تاریخ تحلیل"])
    for ga in gold_analyses:
        writer.writerow([
            ga.id,
            round(ga.gross_weight, 8),
            round(ga.initial_purity, 8),
            round(ga.tola_rate, 8),
            round(ga.final_weight, 8),
            round(ga.usd_rate, 8),
            format_date(ga.analysis_date)
        ])
    writer.writerow([])

    # 6. بخش دفتر طلا
    writer.writerow(["گزارش دفتر طلا"])
    writer.writerow(["id", "مشتری", "تاریخ تراکنش", "توضیحات", "دریافتی", "پرداختی", "عیار پاشنه", "بیلانس"])
    total_gold_received = 0
    total_gold_paid = 0
    total_gold_balance = 0
    for gl in gold_ledgers:
        cust_name = gl.customer.full_name if gl.customer else gl.customer_id
        writer.writerow([
            gl.gold_ledger_id,
            cust_name,
            format_datetime(gl.transaction_date),
            gl.description or "-",
            round(gl.received, 8),
            round(gl.paid, 8),
            round(gl.heel_purity_carat, 8) if gl.heel_purity_carat else "-",
            round(gl.balance, 8)
        ])
        total_gold_received += gl.received
        total_gold_paid += gl.paid
        total_gold_balance += gl.balance

    writer.writerow(["جمع‌بندی دفتر طلا"])
    writer.writerow(["مجموع دریافتی", "مجموع پرداختی", "مجموع بیلانس"])
    writer.writerow([
        round(total_gold_received, 8),
        round(total_gold_paid, 8),
        round(total_gold_balance, 8)
    ])
    writer.writerow([])

    # 7. بخش دفتر پول
    writer.writerow(["گزارش دفتر پول"])
    writer.writerow(["id", "مشتری", "تاریخ تراکنش", "توضیحات", "دریافتی", "پرداختی", "بیلانس دالر"])
    total_money_received = 0
    total_money_paid = 0
    total_usd_balance = 0
    for ml in money_ledgers:
        cust_name = ml.customer.full_name if ml.customer else ml.customer_id
        writer.writerow([
            ml.money_ledger_id,
            cust_name,
            format_datetime(ml.transaction_date),
            ml.description or "-",
            round(ml.received, 8),
            round(ml.paid, 8),
            round(ml.usd_balance, 8)
        ])
        total_money_received += ml.received
        total_money_paid += ml.paid
        total_usd_balance += ml.usd_balance

    writer.writerow(["جمع‌بندی دفتر پول"])
    writer.writerow(["مجموع دریافتی", "مجموع پرداختی", "مجموع بیلانس دالر"])
    writer.writerow([
        round(total_money_received, 8),
        round(total_money_paid, 8),
        round(total_usd_balance, 8)
    ])
    writer.writerow([])

    # 8. امضا یا مهر دفتر
    writer.writerow(["امضا یا مهر دفتر:"])

    # 9. ایجاد پاسخ StreamingResponse
    output.seek(0)
    content = "\ufeff" + output.getvalue()  # اضافه کردن UTF-8 BOM برای پشتیبانی از فارسی
    buffer = io.BytesIO(content.encode('utf-8'))
    buffer.seek(0)

    today_str = datetime.utcnow().strftime('%Y%m%d')
    filename = f"report_{today_str}.csv"

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
