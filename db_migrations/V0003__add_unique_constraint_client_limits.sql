-- Добавление уникального ограничения для client_id в таблице client_limits
ALTER TABLE t_p14771149_mfo_client_cabinet.client_limits 
ADD CONSTRAINT unique_client_limit UNIQUE (client_id);