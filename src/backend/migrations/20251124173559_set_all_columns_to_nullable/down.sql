ALTER TABLE users MODIFY COLUMN reset_token_expires datetime;
ALTER TABLE users DROP COLUMN fullname;