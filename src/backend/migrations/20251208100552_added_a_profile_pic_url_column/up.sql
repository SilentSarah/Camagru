ALTER TABLE users MODIFY COLUMN fullname VARCHAR(255);
ALTER TABLE users MODIFY COLUMN verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN profile_pic_url VARCHAR(255);
ALTER TABLE users MODIFY COLUMN verification_token_gen_date INT;
ALTER TABLE users MODIFY COLUMN reset_token VARCHAR(255);
ALTER TABLE users MODIFY COLUMN reset_token_expires VARCHAR(255);