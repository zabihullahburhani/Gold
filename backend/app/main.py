# path: backend/app/main.py
from fastapi import FastAPI,  Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, engine
from fastapi.responses import Response

from app.api.v1 import shop_expenses
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.customers import router as customers_router
from app.api.v1.debts import router as debts_router 
from app.api.v1.transactions import router as transactions_router
from app.api.v1.gold_types import router as gold_types_router 
from app.api.v1.notifications import router as notifications_router
from app.api.v1.gold_rates import router as  gold_rates_router
from app.api.v1.activations import router as activations_router
from app.api.v1.reports import router as reports_router
from app.api.v1.gold_analysis import router as goldanalysis_router
from app.api.v1.capital import router as capital_router
from app.api.v1.money_ledger import router as money_ledger_router
from app.api.v1 import invoices
from app.api.v1 import backup
from app.api.v1 import gold_ledger


# models for SQL...
import app.models.user
import app.models.shop_expense



# اگر لازم شد جداول جدید ساخته شوند (برای SQLite)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# مدیریت دستی درخواست‌های OPTIONS
@app.middleware("http")
async def custom_options_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": "true",
            },
        )
    response = await call_next(request)
    return response

# تنظیمات CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://192.168.2.102:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# سرو کردن عکس‌های پروفایل
app.mount("/static", StaticFiles(directory="static"), name="static")

# API v1
# سایر روترها
app.include_router(shop_expenses.router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
#customer
app.include_router(customers_router, prefix="/api/v1")
app.include_router(debts_router, prefix="/api/v1")
app.include_router(transactions_router, prefix="/api/v1")
app.include_router(gold_types_router, prefix="/api/v1")
app.include_router (notifications_router, prefix="/api/v1")
app.include_router(gold_rates_router, prefix="/api/v1")
app.include_router(activations_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")
app.include_router(goldanalysis_router, prefix="/api/v1")

app.include_router(invoices.router, prefix="/api/v1")
app.include_router(backup.router, prefix="/api/v1")
app.include_router(money_ledger_router, prefix="/api/v1")

app.include_router(gold_ledger.router, prefix="/api/v1")
app.include_router(capital_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}

# created by: professor zabihullah burhani
# ICT and AI and Robotics متخصص
# phone: 0705002913, email: zabihullahburhani@gmail.com
# Address: Takhar University, COmputer science faculty.
