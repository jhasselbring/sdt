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
  try {
    db.pragma('journal_mode = WAL');

    // Run migrations
    const migrationsPath = path.join(__dirname, '../db');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    const runMigrations = db.transaction(() => {
      for (const migrationFile of migrationFiles) {
        const sql = fs.readFileSync(path.join(migrationsPath, migrationFile), 'utf8');
        db.exec(sql);
        console.log(`Ran migration: ${migrationFile}`);
      }
    });
    runMigrations();

    console.log('Database initialized and migrations applied.');
  } catch (error) {
    console.error('Error during database initialization or migration:', error);
    if (db) {
      db.close();
      db = null;
    }
    throw error; // Re-throw the error to signal failure
  }
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

    const insertMeta = projectDbInstance.prepare(`
      INSERT INTO meta (key, value) VALUES (@key, @value)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value;
    `);

    const insertAllMetadata = projectDbInstance.transaction((entries) => {
      for (const entry of entries) insertMeta.run(entry);
    });

    const metadataEntries = Object.entries(metadata).map(([key, value]) => ({ 
      key,
      value: String(value)
    }));

    insertAllMetadata(metadataEntries);
    console.log('Project meta table initialized successfully.');
  } catch (error) {
    console.error('Error initializing project meta table:', error);
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