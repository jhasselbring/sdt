/* eslint-disable */
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db = null;

export function initializeDatabase(dbPath) {
  if (db) {
    console.log('Database already initialized.');
    return;
  }

  const fullDbPath = path.resolve(dbPath);
  console.log(`Initializing database at: ${fullDbPath}`);
  db = new Database(fullDbPath);
  db.pragma('journal_mode = WAL');

  // Run migrations
  const migrationsPath = path.join(__dirname, '../db');
  const migrations = fs.readdirSync(migrationsPath)
    .filter(file => file.endsWith('.sql'))
    .sort();

  db.transaction(() => {
    for (const migration of migrations) {
      const sql = fs.readFileSync(path.join(migrationsPath, migration), 'utf8');
      db.exec(sql);
      console.log(`Ran migration: ${migration}`);
    }
  })();

  console.log('Database initialized and migrations applied.');
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