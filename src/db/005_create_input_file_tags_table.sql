CREATE TABLE input_file_tags (
  input_file_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (input_file_id, tag_id),
  FOREIGN KEY (input_file_id) REFERENCES input_files(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);