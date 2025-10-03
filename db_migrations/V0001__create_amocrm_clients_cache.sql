-- Таблица для кэширования данных клиентов из AmoCRM
CREATE TABLE IF NOT EXISTS amocrm_clients (
    id BIGINT PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    middle_name VARCHAR(100),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amocrm_created_at TIMESTAMP,
    raw_data JSONB
);

-- Таблица для кэширования сделок клиентов
CREATE TABLE IF NOT EXISTS amocrm_deals (
    id BIGINT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    name VARCHAR(255),
    price NUMERIC(12, 2),
    status VARCHAR(50),
    status_id INTEGER,
    status_name VARCHAR(255),
    status_color VARCHAR(20),
    pipeline_id INTEGER,
    pipeline_name VARCHAR(255),
    responsible_user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amocrm_created_at TIMESTAMP,
    amocrm_updated_at TIMESTAMP,
    custom_fields JSONB,
    raw_data JSONB,
    CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES amocrm_clients(id)
);

-- Таблица для кэширования займов
CREATE TABLE IF NOT EXISTS amocrm_loans (
    id BIGINT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    deal_id BIGINT NOT NULL,
    amount NUMERIC(12, 2),
    paid_amount NUMERIC(12, 2) DEFAULT 0,
    status VARCHAR(50),
    rate NUMERIC(5, 2),
    next_payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loan_client FOREIGN KEY (client_id) REFERENCES amocrm_clients(id),
    CONSTRAINT fk_loan_deal FOREIGN KEY (deal_id) REFERENCES amocrm_deals(id)
);

-- Таблица для истории платежей
CREATE TABLE IF NOT EXISTS amocrm_payments (
    id VARCHAR(100) PRIMARY KEY,
    loan_id BIGINT NOT NULL,
    amount NUMERIC(12, 2),
    payment_date DATE,
    payment_type VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_loan FOREIGN KEY (loan_id) REFERENCES amocrm_loans(id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_clients_phone ON amocrm_clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_last_sync ON amocrm_clients(last_sync_at);
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON amocrm_deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_updated ON amocrm_deals(amocrm_updated_at);
CREATE INDEX IF NOT EXISTS idx_loans_client_id ON amocrm_loans(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON amocrm_payments(loan_id);