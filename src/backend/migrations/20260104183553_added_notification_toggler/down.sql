ALTER TABLE users MODIFY COLUMN reset_token_expires varchar(255);
ALTER TABLE users MODIFY COLUMN reset_token varchar(255);
ALTER TABLE users MODIFY COLUMN verification_token_gen_date int(11);
ALTER TABLE users MODIFY COLUMN profile_pic_url varchar(255);
ALTER TABLE users MODIFY COLUMN verification_token varchar(255);
ALTER TABLE users DROP COLUMN email_notifications;
ALTER TABLE users MODIFY COLUMN bio varchar(255);
ALTER TABLE users MODIFY COLUMN fullname varchar(255);