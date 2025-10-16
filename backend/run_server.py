# run_server.py
import uvicorn
import os

if __name__ == "__main__":
    # بررسی وجود فایل دیتابیس
    db_path = os.path.join(os.path.dirname(__file__), "backend.db")
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database file {db_path} not found")
    
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, log_level="info")