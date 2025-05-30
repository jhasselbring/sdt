CREATE TABLE meta (
    version INTEGER PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

INSERT INTO meta (version, created_at, updated_at) VALUES (1, strftime('%s', 'now'), strftime('%s', 'now'));