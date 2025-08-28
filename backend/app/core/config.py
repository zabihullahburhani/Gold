# backend/app/core/config.py
# Configuration settings.
# No changes needed.

import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DB_FILE = os.path.join(BASE_DIR, "..", "backend.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_FILE}")

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey_change_me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24