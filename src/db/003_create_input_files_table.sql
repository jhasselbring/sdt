CREATE TABLE input_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  directory_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  extension TEXT NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'ignored'
  processed BOOLEAN NOT NULL DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (directory_id) REFERENCES input_directories(id)
);