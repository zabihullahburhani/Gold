-- ایجاد جدول employees
CREATE TABLE IF NOT EXISTS employees (
    employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ایجاد جدول logins
CREATE TABLE IF NOT EXISTS logins (
    login_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    last_login DATETIME,
    FOREIGN KEY(employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- ایجاد جدول customers
CREATE TABLE IF NOT EXISTS customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ایجاد جدول shop_expenses
CREATE TABLE IF NOT EXISTS shop_expenses (
    expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_type TEXT NOT NULL,
    amount REAL NOT NULL,
    expense_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    employee_id INTEGER,
    FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
);

-- ایجاد جدول shop_balance
CREATE TABLE IF NOT EXISTS shop_balance (
    balance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    gold_balance_grams REAL DEFAULT 0,
    cash_balance_usd REAL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ایجاد جدول gold_types
CREATE TABLE IF NOT EXISTS gold_types (
    gold_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
);

-- ایجاد جدول gold_rates
CREATE TABLE IF NOT EXISTS gold_rates (
    rate_id INTEGER PRIMARY KEY AUTOINCREMENT,
    gold_type_id INTEGER NOT NULL,
    rate_per_gram REAL NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(gold_type_id) REFERENCES gold_types(gold_type_id)
);

-- ایجاد جدول transactions
CREATE TABLE IF NOT EXISTS transactions (
    txn_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    gold_type_id INTEGER NOT NULL,
    grams REAL NOT NULL,
    rate_per_gram REAL NOT NULL,
    total_usd REAL NOT NULL,
    txn_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY(employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY(gold_type_id) REFERENCES gold_types(gold_type_id)
);

-- اضافه کردن کاربران پیشفرض
INSERT INTO employees (full_name, role, phone)
VALUES 
('Admin User', 'admin', '000'),
('Normal User', 'user', '111');

-- هش شده با bcrypt نمونه: "1234"
INSERT INTO logins (employee_id, username, password_hash)
VALUES
(1, 'admin', '$2b$12$X4nFU3ku/y76g7nLUQ9FJOzZL0Jp3nIYtOcqsoHFch8HECKm17Dr2'),
(2, 'user', '$2b$12$9WNGIFSXk./aPSjVfw8M7Ol/.6L4HpybAVbyg350mil/JbUME96e6');

-- ===============================
-- Add Notifications Table
-- ===============================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
);

-- ===============================
-- Add User Profile Pictures Table
-- ===============================
CREATE TABLE IF NOT EXISTS user_profiles (
    profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    picture_url TEXT, -- می‌تواند مسیر فایل یا URL باشد
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
);

-- ===============================
-- Add Shop Logo and Banner Table
-- ===============================
CREATE TABLE IF NOT EXISTS shop_assets (
    asset_id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- "logo" or "banner"
    file_url TEXT NOT NULL,
    uploaded_by INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(uploaded_by) REFERENCES employees(employee_id)
);

-- ===============================
-- Optional: Initial Data for Shop Assets
-- ===============================
INSERT INTO shop_assets (type, file_url) VALUES ('logo', 'default_logo.png');
INSERT INTO shop_assets (type, file_url) VALUES ('banner', 'default_banner.png');
