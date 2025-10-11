-- Добавляем поле пароля для клиентов
ALTER TABLE t_p14771149_mfo_client_cabinet.clients 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);