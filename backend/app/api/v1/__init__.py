# app/api/v1/__init__.py
from app.api.v1.gold_ledger import router as gold_ledger_router

__all__ = ["gold_ledger_router"]