ALTER TABLE photos ADD COLUMN image_path varchar(255) NOT NULL;
ALTER TABLE photos MODIFY COLUMN created_at datetime;
ALTER TABLE photos MODIFY COLUMN description text;
ALTER TABLE photos DROP COLUMN file_name;