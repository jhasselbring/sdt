/* eslint-disable */
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { scanInputDirectory, watchInputDirectory } from '../services/fileSyncService.js';
import { BrowserWindow } from 'electron';
import { app } from 'electron';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let db = null;

// Self-contained dbService for use within initializeDatabase
const internalDbService = {
  getFilesByDirectoryId: async (inputDirId) => {
    if (!db) throw new Error('Database not initialized.');
    return all('SELECT * FROM input_files WHERE input_dir_id = ?', [inputDirId]);
  },
  getFileByAbsolutePath: async (absolutePath) => {
    if (!db) throw new Error('Database not initialized.');
    return get('SELECT * FROM input_files WHERE absolute_path = ?', [absolutePath]);
  },
  insertFile: async (fileData) => {
    if (!db) throw new Error('Database not initialized.');
    const sql = `
      INSERT INTO input_files (id, input_dir_id, absolute_path, relative_path, content_hash, date_added, date_modified, status, processed, completed_manually)
      VALUES (@id, @input_dir_id, @absolute_path, @relative_path, @content_hash, @date_added, @date_modified, @status, @processed, @completed_manually)
      ON CONFLICT(absolute_path) DO UPDATE SET
        content_hash = excluded.content_hash,
        date_modified = excluded.date_modified,
        status = excluded.status,
        processed = excluded.processed,
        completed_manually = excluded.completed_manually
    `;
    const paramsForInsert = {
      ...fileData,
      processed: fileData.processed ? 1 : 0,
      completed_manually: fileData.completed_manually ? 1 : 0,
    };
    console.log('[DB internalDbService.insertFile] Params before run:', JSON.stringify(paramsForInsert, null, 2)); // DEBUG LINE
    return run(sql, paramsForInsert);
  },
  updateFile: async (fileId, updates) => {
    if (!db) throw new Error('Database not initialized.');
    const setClauses = Object.keys(updates).map(key => `${key} = @${key}`).join(', ');
    const sql = `UPDATE input_files SET ${setClauses} WHERE id = @id`;
    
    const params = { ...updates, id: fileId };
    if (typeof params.processed === 'boolean') {
      params.processed = params.processed ? 1 : 0;
    }
    if (typeof params.completed_manually === 'boolean') {
      params.completed_manually = params.completed_manually ? 1 : 0;
    }
    return run(sql, params);
  },
  updateFileByPath: async (absolutePath, updates) => {
    if (!db) throw new Error('Database not initialized.');
    const setClauses = Object.keys(updates).map(key => `${key} = @${key}`).join(', ');
    const sql = `UPDATE input_files SET ${setClauses} WHERE absolute_path = @absolute_path`;

    const params = { ...updates, absolute_path: absolutePath };
    if (typeof params.processed === 'boolean') {
      params.processed = params.processed ? 1 : 0;
    }
    if (typeof params.completed_manually === 'boolean') {
      params.completed_manually = params.completed_manually ? 1 : 0;
    }
    return run(sql, params);
  }
};

export async function initializeDatabase(dbPath) {
  closeDb(); // Close any existing global DB connection

  const fullDbPath = path.resolve(dbPath);
  console.log(`[DB] Initializing database at: ${fullDbPath}`);
  db = new Database(fullDbPath); // Assign to global db
  db.pragma('journal_mode = WAL');
  console.log(`[DB] Database ${fullDbPath} is now active.`);

  // Trigger file sync for all input directories in this database
  try {
    console.log('[DB] Querying for input directories to start sync...');
    const directories = all('SELECT id, path FROM input_directories'); // Use synchronous `all` here as db is initialized
    
    if (directories && directories.length > 0) {
      console.log(`[DB] Found ${directories.length} input director(y/ies). Starting scan and watch...`);
      for (const dir of directories) {
        console.log(`[DB] Starting initial scan for ${dir.path} (ID: ${dir.id})`);
        await scanInputDirectory(dir.id, dir.path, internalDbService);
        console.log(`[DB] Scan complete for ${dir.path}. Initializing watcher...`);
        watchInputDirectory(dir.id, dir.path, internalDbService)
          .then(watcherInstance => {
            console.log(`[DB] Watcher successfully initialized for ${dir.path}`);
            // Optionally manage watcherInstance
          })
          .catch(watchError => {
            console.error(`[DB] Error initializing watcher for ${dir.path}:`, watchError);
          });
      }
    } else {
      console.log('[DB] No input directories found in this database to sync.');
    }
  } catch (error) {
    console.error('[DB] Error during automated file sync initialization:', error);
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
  console.log(`[DB run] Attempting to execute SQL: ${sql}`); // DEBUG LINE
  console.log(`[DB run] Received params (raw):`, params); // DEBUG LINE - logs the object directly
  console.log(`[DB run] Received params (JSON): ${JSON.stringify(params, null, 2)}`); // DEBUG LINE
  console.log(`[DB run] typeof params: ${typeof params}`); // DEBUG LINE
  if (params !== null && typeof params === 'object') {
    Object.keys(params).forEach(key => {
      console.log(`[DB run] Param key: ${key}, value: ${params[key]}, typeof value: ${typeof params[key]}`); // DEBUG LINE
    });
  }

  try {
    const stmt = db.prepare(sql);
    return stmt.run(params);
  } catch (e) {
    console.error(`[DB run] Error executing SQL: ${sql} with JSON params: ${JSON.stringify(params, null, 2)}`, e); // Enhanced error log
    throw e;
  }
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

// Functions for fileSyncService
export async function getFilesByDirectoryId(inputDirId) {
  if (!db) throw new Error('Database not initialized.');
  return all('SELECT * FROM input_files WHERE input_dir_id = ?', [inputDirId]);
}

export async function getFileByAbsolutePath(absolutePath) {
  if (!db) throw new Error('Database not initialized.');
  return get('SELECT * FROM input_files WHERE absolute_path = ?', [absolutePath]);
}

export async function insertFile(fileData) {
  if (!db) throw new Error('Database not initialized.');
  const sql = `
    INSERT INTO input_files (id, input_dir_id, absolute_path, relative_path, content_hash, date_added, date_modified, status, processed, completed_manually)
    VALUES (@id, @input_dir_id, @absolute_path, @relative_path, @content_hash, @date_added, @date_modified, @status, @processed, @completed_manually)
    ON CONFLICT(absolute_path) DO UPDATE SET
      content_hash = excluded.content_hash,
      date_modified = excluded.date_modified,
      status = excluded.status,
      processed = excluded.processed,
      completed_manually = excluded.completed_manually
  `;
  const paramsForInsert = {
    ...fileData,
    processed: fileData.processed ? 1 : 0,
    completed_manually: fileData.completed_manually ? 1 : 0,
  };
  console.log('[DB exported.insertFile] Params before run:', JSON.stringify(paramsForInsert, null, 2)); // DEBUG LINE
  return run(sql, paramsForInsert);
}

export async function updateFile(fileId, updates) {
  if (!db) throw new Error('Database not initialized.');
  const setClauses = Object.keys(updates).map(key => `${key} = @${key}`).join(', ');
  const sql = `UPDATE input_files SET ${setClauses} WHERE id = @id`;
  
  const params = { ...updates, id: fileId };
  if (typeof params.processed === 'boolean') {
    params.processed = params.processed ? 1 : 0;
  }
  if (typeof params.completed_manually === 'boolean') {
    params.completed_manually = params.completed_manually ? 1 : 0;
  }
  console.log('[DB exported.updateFile] Params before run:', JSON.stringify(params, null, 2)); // DEBUG LINE
  return run(sql, params);
}

export async function updateFileByPath(absolutePath, updates) {
  if (!db) throw new Error('Database not initialized.');
  const setClauses = Object.keys(updates).map(key => `${key} = @${key}`).join(', ');
  const sql = `UPDATE input_files SET ${setClauses} WHERE absolute_path = @absolute_path`;

  const params = { ...updates, absolute_path: absolutePath };
  if (typeof params.processed === 'boolean') {
    params.processed = params.processed ? 1 : 0;
  }
  if (typeof params.completed_manually === 'boolean') {
    params.completed_manually = params.completed_manually ? 1 : 0;
  }
  return run(sql, params);
}
// End functions for fileSyncService

export function notifyDbUpdated(mainWindow) {
  if (!db || !mainWindow) return;
  const inputDirs = all('SELECT * FROM input_directories');
  const files = all('SELECT * FROM input_files');
  const meta = all('SELECT * FROM meta');
  mainWindow.webContents.send('db-updated', { inputDirs, files, meta });
}

export async function initializeProjectDatabase(filePath, metadata) {
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
  // setting WAL mode, and running all standard migrations AND NOW FILE SYNC.
  await initializeDatabase(filePath);
  // Notify renderer after DB is ready
  if (global.mainWindowRef) notifyDbUpdated(global.mainWindowRef);
}