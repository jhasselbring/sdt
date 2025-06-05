/* eslint-disable */
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db = null;

export function initializeDatabase(dbPath) {
  closeDb(); // Close any existing global DB connection

  const fullDbPath = path.resolve(dbPath);
  console.log(`Initializing database at: ${fullDbPath}`);
  db = new Database(fullDbPath); // Assign to global db
  db.pragma('journal_mode = WAL');
  
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
    console.log('Database closed.');
  }
}

// Generic CRUD operations
export function run(sql, params = []) {
  if (!db) throw new Error('Database not initialized.');
  return db.prepare(sql).run(params);
}

export function get(sql, params = []) {
  if (!db) throw new Error('Database not initialized.');
  return db.prepare(sql).get(params);
}

export function all(sql, params = []) {
  if (!db) throw new Error('Database not initialized.');
  return db.prepare(sql).all(params);
}

export function transaction(fn) {
  if (!db) throw new Error('Database not initialized.');
  return db.transaction(fn);
}

export function initializeProjectDatabase(filePath, metadata) {
  // Step 1: Create and populate the new project database file with its meta table
  const projectDbInstance = new Database(filePath);
  try {
    projectDbInstance.exec(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    // Handle inputDir and prepare metadata for the 'meta' table
    let initialDirs = [];
    const inputDirKey = 'inputDir'; // Standardized key based on user feedback

    if (metadata && metadata.hasOwnProperty(inputDirKey)) {
      const inputDirValue = metadata[inputDirKey];
      if (typeof inputDirValue === 'string' && inputDirValue.trim() !== '') {
        initialDirs = [inputDirValue.trim()];
      } else if (Array.isArray(inputDirValue)) {
        initialDirs = inputDirValue.map(dir => typeof dir === 'string' ? dir.trim() : null).filter(Boolean);
      }
    }

    const metaTableData = { ...metadata };
    // Remove inputDir from the object that will be saved to the 'meta' table
    if (metaTableData.hasOwnProperty(inputDirKey)) {
      delete metaTableData[inputDirKey];
    }

    const insertMeta = projectDbInstance.prepare(`
      INSERT INTO meta (key, value) VALUES (@key, @value)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value;
    `);

    const insertAllMetadataTransaction = projectDbInstance.transaction((entries) => {
      for (const entry of entries) insertMeta.run(entry);
    });

    const metadataEntries = Object.entries(metaTableData).map(([key, value]) => ({
      key,
      value: String(value) // Ensure value is a string for the meta table
    }));

    insertAllMetadataTransaction(metadataEntries);
    console.log('Project meta table initialized successfully.');

    // Add creation for other tables as per idea.md
    projectDbInstance.exec(`
      CREATE TABLE IF NOT EXISTS input_directories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE NOT NULL,
        date_added TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS input_files (
        id TEXT PRIMARY KEY, -- md5(absolute_path)
        input_dir_id INTEGER NOT NULL,
        absolute_path TEXT UNIQUE NOT NULL,
        relative_path TEXT NOT NULL,
        content_hash TEXT, -- md5(file content)
        date_added TEXT NOT NULL,
        date_modified TEXT,
        status TEXT DEFAULT 'new', -- e.g., new, updated, missing, found
        processed BOOLEAN DEFAULT 0,
        completed_manually BOOLEAN DEFAULT 0,
        FOREIGN KEY (input_dir_id) REFERENCES input_directories(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag TEXT UNIQUE NOT NULL,
        used_count INTEGER DEFAULT 0,
        last_used TEXT
      );
    `);
    console.log('Project tables (input_directories, input_files, tags) created successfully.');

    // Insert initialInputDirs if any
    if (initialDirs.length > 0) {
      const insertInputDir = projectDbInstance.prepare(`
        INSERT INTO input_directories (path, date_added)
        VALUES (@path, @date_added)
        ON CONFLICT(path) DO NOTHING; -- If a path is already listed, ignore it.
      `);

      const insertAllInputDirsTransaction = projectDbInstance.transaction((dirs) => {
        const now = new Date().toISOString();
        for (const dirPath of dirs) {
          if (typeof dirPath === 'string' && dirPath.trim() !== '') {
            try {
              insertInputDir.run({ path: dirPath.trim(), date_added: now });
            } catch (err) {
              console.warn(`Could not insert initial directory '${dirPath}': ${err.message}`);
            }
          } else {
            console.warn(`Skipping invalid initial directory entry: ${dirPath}`);
          }
        }
      });

      insertAllInputDirsTransaction(initialDirs);
      console.log('Initial input directories processed.');
    }

  } catch (error) {
    console.error('Error initializing project database structure or initial data:', error); // More generic error message
    projectDbInstance.close(); // Ensure the temp instance is closed on error
    throw error; // Propagate the error
  } finally {
    projectDbInstance.close(); // Ensure the temp instance is closed
  }

  // Step 2: Now, make this newly created and seeded database the global active one.
  // initializeDatabase will handle closing any previous global db, opening this one,
  // setting WAL mode, and running all standard migrations.
  initializeDatabase(filePath);
  console.log(`Project database ${filePath} is now the active database.`);
}