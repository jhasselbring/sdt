/**
 * Database IPC Handlers
 * These functions handle IPC requests related to database operations.
 * Each handler is designed to be used with Electron's ipcMain.handle.
 *
 * Usage: Import and register with ipcMain in your main process.
 */
import { run, get, all } from '../tmp/database.js';

/**
 * Handles SQL run queries (INSERT/UPDATE/DELETE).
 */
export async function handleDbRun(_, sql, params) {
  try {
    const result = await run(sql, params);
    return { success: true, data: result };
  } catch (error) {
    console.error('Database run error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Handles SQL get queries (SELECT single row).
 */
export async function handleDbGet(_, sql, params) {
  try {
    const result = await get(sql, params);
    return { success: true, data: result };
  } catch (error) {
    console.error('Database get error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Handles SQL all queries (SELECT multiple rows).
 */
export async function handleDbAll(_, sql, params) {
  try {
    const result = await all(sql, params);
    return { success: true, data: result };
  } catch (error) {
    console.error('Database all error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Returns all input directories from the database.
 */
export async function handleGetAllInputDirectories() {
  try {
    const dirs = await all('SELECT id, path FROM input_directories ORDER BY path');
    return { success: true, data: dirs };
  } catch (error) {
    console.error('Error fetching all input directories:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Returns all files in a given input directory.
 * @param {any} _ - Unused event parameter
 * @param {number} directoryId - The ID of the input directory
 */
export async function handleGetFilesInDirectory(_, directoryId) {
  if (directoryId === null || typeof directoryId === 'undefined') {
    return { success: false, error: 'directoryId is required' };
  }
  try {
    const files = await all(
      'SELECT id, absolute_path, relative_path, status, content_hash FROM input_files WHERE input_dir_id = ? ORDER BY relative_path',
      [directoryId]
    );
    return { success: true, data: files };
  } catch (error) {
    console.error(`Error fetching files for directory ID ${directoryId}:`, error);
    return { success: false, error: error.message };
  }
} 