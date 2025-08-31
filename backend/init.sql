-- جدول کارمندان
CREATE TABLE employees (
    employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    profile_pic TEXT
);

-- جدول ورود (لاگین)
CREATE TABLE logins (
    login_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    last_login DATETIME,
    FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
);

-- جدول مشتریان
CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول بدهی‌ها (جدید)
CREATE TABLE debts (
    debt_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    employee_id INTEGER,
    amount_usd REAL DEFAULT 0,
    amount_afn REAL DEFAULT 0,
    due_date DATETIME,
    status TEXT DEFAULT 'unpaid', -- unpaid, paid, partial
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
);

-- جدول مصارف دوکان
CREATE TABLE shop_expenses (
    expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_type TEXT NOT NULL,
    amount_usd REAL DEFAULT 0,
    amount_afn REAL DEFAULT 0,
    expense_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    employee_id INTEGER,
    FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
);

-- جدول موجودی
CREATE TABLE shop_balance (
    balance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    gold_balance_grams REAL DEFAULT 0,
    cash_balance_usd REAL DEFAULT 0,
    cash_balance_afn REAL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول انواع طلا
CREATE TABLE gold_types (
    gold_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
);

-- جدول نرخ طلا
CREATE TABLE gold_rates (
    rate_id INTEGER PRIMARY KEY AUTOINCREMENT,
    gold_type_id INTEGER NOT NULL,
    rate_per_gram_usd REAL NOT NULL,
    rate_per_gram_afn REAL NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(gold_type_id) REFERENCES gold_types(gold_type_id)
);

-- جدول تراکنش‌ها
CREATE TABLE transactions (
    txn_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    gold_type_id INTEGER NOT NULL,
    grams REAL NOT NULL,
    rate_per_gram_usd REAL NOT NULL,
    rate_per_gram_afn REAL NOT NULL,
    total_usd REAL NOT NULL,
    total_afn REAL NOT NULL,
    txn_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY(employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY(gold_type_id) REFERENCES gold_types(gold_type_id)
);

-- جدول نوتیفیکیشن‌ها
CREATE TABLE notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
);

-- جدول پروفایل کاربر
CREATE TABLE user_profiles (
    profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    picture_url TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
);

-- جدول دارایی‌های دوکان (لوگو، بنر و غیره)
CREATE TABLE shop_assets (
    asset_id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- logo, banner, etc.
    file_url TEXT NOT NULL,
    uploaded_by INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(uploaded_by) REFERENCES employees(employee_id)
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

