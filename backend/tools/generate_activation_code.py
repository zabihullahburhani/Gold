# tools/generate_activation_code.py
import hmac
import hashlib
import base64
import json
from datetime import datetime, timedelta

SECRET = b"replace_with_real_secret_key_change_this"  # فقط در سمت ادمین و امن نگهداری شود

def generate_code(motherboard_code: str, expiry_days: int = 180):
    payload = {
        "mb": motherboard_code,
        "exp": (datetime.utcnow() + timedelta(days=expiry_days)).strftime("%Y-%m-%d")
    }
    raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode()
    sig = hmac.new(SECRET, raw, hashlib.sha256).digest()
    code = base64.urlsafe_b64encode(raw + b"." + sig).decode()
    return code

def verify_code(code: str):
    try:
        data = base64.urlsafe_b64decode(code.encode())
        raw, sig = data.rsplit(b".", 1)
        expected = hmac.new(SECRET, raw, hashlib.sha256).digest()
        if hmac.compare_digest(expected, sig):
            payload = json.loads(raw.decode())
            return payload
    except Exception:
        return None

if __name__ == "__main__":
    print(generate_code("MB-123-EXAMPLE"))
