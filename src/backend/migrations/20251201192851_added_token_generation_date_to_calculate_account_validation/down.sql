ALTER TABLE users MODIFY COLUMN created_at datetime;
ALTER TABLE users MODIFY COLUMN reset_token_expires varchar(255);
ALTER TABLE users MODIFY COLUMN reset_token varchar(255);
ALTER TABLE users DROP COLUMN verification_token_gen_date;
ALTER TABLE users MODIFY COLUMN verification_token varchar(255);
ALTER TABLE users MODIFY COLUMN fullname varchar(255);