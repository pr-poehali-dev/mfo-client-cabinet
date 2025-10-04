-- Создание таблицы клиентов с лимитами
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    middle_name VARCHAR(100),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы лимитов клиентов
CREATE TABLE IF NOT EXISTS client_limits (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    max_loan_amount DECIMAL(12, 2) DEFAULT 100000.00,
    current_debt DECIMAL(12, 2) DEFAULT 0.00,
    available_limit DECIMAL(12, 2) DEFAULT 100000.00,
    credit_rating VARCHAR(20) DEFAULT 'good',
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_reason TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы истории займов
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    amocrm_deal_id VARCHAR(50),
    amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT 0.00,
    rate DECIMAL(5, 2) DEFAULT 24.50,
    status VARCHAR(20) DEFAULT 'active',
    next_payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_loans_client_id ON loans(client_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_client_limits_client_id ON client_limits(client_id);