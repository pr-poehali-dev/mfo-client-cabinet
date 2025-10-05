-- Создание таблицы для хранения уведомлений о смене статусов сделок

CREATE TABLE IF NOT EXISTS webhook_notifications (
    id SERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL,
    new_status_id BIGINT NOT NULL,
    old_status_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP
);

CREATE INDEX idx_webhook_notifications_lead_id ON webhook_notifications(lead_id);
CREATE INDEX idx_webhook_notifications_delivered ON webhook_notifications(delivered) WHERE delivered = FALSE;
