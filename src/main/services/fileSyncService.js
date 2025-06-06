import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import chokidar from 'chokidar';

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

/**
 * Calculates the MD5 hash of a file's content.
 * @param {string} filePath Absolute path to the file.
 * @returns {Promise<string|null>} MD5 hash of the file content, or null if error.
 */
async function calculateFileContentHash(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
  } catch (error) {
    console.error(`Error calculating content hash for ${filePath}:`, error);
    return null; // Handle inaccessible files
  }
}

/**
 * Calculates the MD5 hash of a string (typically a file path for ID).
 * @param {string} text The string to hash.
 * @returns {string} MD5 hash.
 */
function calculatePathHash(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * Checks if a file has a supported extension.
 * @param {string} filePath Path to the file.
 * @returns {boolean} True if supported, false otherwise.
 */
function isSupportedFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * Recursively scans an input directory and synchronizes file states with the database.
 * This function is typically called on app startup or when a new input directory is added.
 * @param {number} inputDirId
 * @param {string} directoryPath
 * @param {object} dbService - Database service instance
 */
export async function scanInputDirectory(
  inputDirId,
  directoryPath,
  dbService
) {
  console.log(`[FileSync] Scanning directory: ${directoryPath} for inputDirId: ${inputDirId}`);
  let dbFilesMap;
  try {
    const dbFiles = await dbService.getFilesByDirectoryId(inputDirId);
    dbFilesMap = new Map(dbFiles.map(file => [file.absolute_path, file]));
  } catch (error) {
    console.error(`[FileSync] Error fetching files from DB for dirId ${inputDirId}:`, error);
    return;
  }

  const filesFoundOnDisk = new Set();

  async function scan(currentPath) {
    let entries;
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch (error) {
      console.error(`[FileSync] Error reading directory ${currentPath}:`, error);
      return; // Skip unreadable directories
    }

    for (const entry of entries) {
      const entryPath = path.resolve(currentPath, entry.name); // Ensure canonical path

      if (entry.isSymbolicLink()) {
        console.log(`[FileSync] Ignoring symlink: ${entryPath}`);
        continue;
      }

      if (entry.isDirectory()) {
        await scan(entryPath);
      } else if (entry.isFile() && isSupportedFile(entryPath)) {
        filesFoundOnDisk.add(entryPath);
        const relativePath = path.relative(directoryPath, entryPath);
        const fileId = calculatePathHash(entryPath);
        const currentContentHash = await calculateFileContentHash(entryPath);
        const now = new Date().toISOString();

        const existingDbRecord = dbFilesMap.get(entryPath);

        if (existingDbRecord) {
          // File exists in DB
          if (currentContentHash === null) { // File inaccessible on disk
            if (existingDbRecord.status !== 'missing') {
              console.log(`[FileSync] File inaccessible, marking as missing: ${entryPath}`);
              await dbService.updateFile(existingDbRecord.id, { status: 'missing', content_hash: null });
            }
          } else if (existingDbRecord.content_hash !== currentContentHash) {
            console.log(`[FileSync] Content changed, updating: ${entryPath}`);
            await dbService.updateFile(existingDbRecord.id, {
              content_hash: currentContentHash,
              date_modified: now,
              status: 'updated',
              processed: false,
              completed_manually: false, // Reset manual completion if content changes
            });
          } else if (existingDbRecord.status === 'missing') {
            // File was missing, now found with same content
            console.log(`[FileSync] File found (was missing): ${entryPath}`);
            await dbService.updateFile(existingDbRecord.id, {
              status: 'found',
              date_modified: now, // Content is same, but file reappeared
            });
          }
          // If content hash is same and status was not 'missing', no change needed.
        } else {
          // New file not in DB for this path
          if (currentContentHash !== null) {
            console.log(`[FileSync] New file detected: ${entryPath}`);
            const fileDataToInsert = {
              id: fileId,
              input_dir_id: inputDirId,
              absolute_path: entryPath,
              relative_path: relativePath,
              content_hash: currentContentHash,
              date_added: now,
              date_modified: now,
              status: 'new',
              processed: false,
              completed_manually: false,
            };
            console.log('[FileSync] Inspecting fileDataToInsert before insert:', JSON.stringify(fileDataToInsert, null, 2)); // DEBUG LINE
            await dbService.insertFile(fileDataToInsert);
          } else {
            console.log(`[FileSync] New file detected but inaccessible: ${entryPath}`);
            // Optionally, insert with 'missing' status or skip
          }
        }
      }
    }
  }

  await scan(directoryPath);

  // Mark files as 'missing' if they are in DB but not found on disk
  for (const [filePath, dbRecord] of dbFilesMap.entries()) {
    if (!filesFoundOnDisk.has(filePath) && dbRecord.status !== 'missing') {
      console.log(`[FileSync] File missing from disk: ${filePath}`);
      await dbService.updateFile(dbRecord.id, { status: 'missing', content_hash: null });
    }
  }
  console.log(`[FileSync] Scan completed for: ${directoryPath}`);
}

/**
 * Watches an input directory for changes and updates the database accordingly.
 * @param {number} inputDirId The ID of the input directory record in the database.
 * @param {string} directoryPath Absolute path to the directory to watch.
 * @param {object} dbService An instance of the database service.
 * @returns {Promise<object>} The chokidar watcher instance.
 */
export async function watchInputDirectory(
  inputDirId,
  directoryPath,
  dbService
) {
  console.log(`[FileSync] Initializing watcher for: ${directoryPath}`);
  const watcher = chokidar.watch(directoryPath, {
    persistent: true,
    ignored: (p, stats) => { // p: string, stats?: fs.Stats
      if (p === directoryPath) return false; // Don't ignore the root itself for events directly in it
      if (/(^|[\/\\])\../.test(p)) return true; // Ignore dotfiles/folders
      if (stats && stats.isSymbolicLink()) {
        console.log(`[FileSync Watcher] Ignoring symlink: ${p}`);
        return true;
      }
      return !isSupportedFile(p) && !(stats && stats.isDirectory());
    },
    ignoreInitial: true, // Don't fire 'add' events for existing files on startup
    awaitWriteFinish: { // Helps with large file writes
      stabilityThreshold: 2000,
      pollInterval: 100
    },
    alwaysStat: true, // Needed for symlink check in ignored and for isDirectory checks
    followSymlinks: false, // Explicitly do not follow symlinks
  });

  const handleFileChange = async (filePath, eventType) => { // filePath: string, eventType: 'add' | 'change' | 'unlink'
    const absolutePath = path.resolve(filePath); // Ensure canonical path

    try {
      const stats = await fs.lstat(absolutePath).catch(() => null);
      if (eventType !== 'unlink' && (!stats || !stats.isFile() || !isSupportedFile(absolutePath))) {
        return;
      }
    } catch (e) { /* For unlink, lstat will fail, that's okay */ }

    console.log(`[FileSync Watcher] Event: ${eventType}, Path: ${absolutePath}`);
    const now = new Date().toISOString();
    const relativePath = path.relative(directoryPath, absolutePath);

    if (eventType === 'add') {
      const currentContentHash = await calculateFileContentHash(absolutePath);
      if (currentContentHash === null) {
        console.log(`[FileSync Watcher] Added file inaccessible: ${absolutePath}`);
        return; // Don't add inaccessible files initially
      }
      const fileId = calculatePathHash(absolutePath);

      const existingRecord = await dbService.getFileByAbsolutePath(absolutePath);
      if (existingRecord) {
        if (existingRecord.status === 'missing') {
          if (existingRecord.content_hash === currentContentHash) {
            console.log(`[FileSync Watcher] File re-added (was missing, content same): ${absolutePath}`);
            await dbService.updateFileByPath(absolutePath, {
              status: 'found',
              date_modified: now,
              content_hash: currentContentHash,
            });
          } else {
            console.log(`[FileSync Watcher] File re-added (was missing, content changed): ${absolutePath}`);
            await dbService.updateFileByPath(absolutePath, {
              status: 'updated',
              content_hash: currentContentHash,
              date_modified: now,
              processed: false,
              completed_manually: false,
            });
          }
        } else {
          console.warn(`[FileSync Watcher] 'add' event for already existing (not missing) file record: ${absolutePath}. Updating content.`);
          await dbService.updateFileByPath(absolutePath, {
            content_hash: currentContentHash,
            date_modified: now,
            status: 'updated',
            processed: false,
            completed_manually: false,
          });
        }
      } else {
        console.log(`[FileSync Watcher] New file added: ${absolutePath}`);
        await dbService.insertFile({
          id: fileId,
          input_dir_id: inputDirId,
          absolute_path: absolutePath,
          relative_path: relativePath,
          content_hash: currentContentHash,
          date_added: now,
          date_modified: now,
          status: 'new',
          processed: false,
          completed_manually: false,
        });
      }
    } else if (eventType === 'change') {
      const currentContentHash = await calculateFileContentHash(absolutePath);
      if (currentContentHash === null) {
        console.log(`[FileSync Watcher] Changed file now inaccessible: ${absolutePath}. Marking as missing.`);
        await dbService.updateFileByPath(absolutePath, { status: 'missing', content_hash: null, date_modified: now });
        return;
      }
      console.log(`[FileSync Watcher] File changed: ${absolutePath}`);
      await dbService.updateFileByPath(absolutePath, {
        content_hash: currentContentHash,
        date_modified: now,
        status: 'updated',
        processed: false,
        completed_manually: false,
      });
    } else if (eventType === 'unlink') {
      console.log(`[FileSync Watcher] File deleted: ${absolutePath}`);
      const existingRecord = await dbService.getFileByAbsolutePath(absolutePath);
      if (existingRecord && existingRecord.status !== 'missing') {
        await dbService.updateFileByPath(absolutePath, {
          status: 'missing',
          content_hash: null,
          date_modified: now,
        });
      } else if (!existingRecord) {
        console.log(`[FileSync Watcher] Unlinked file was not in DB or already missing: ${absolutePath}`);
      }
    }
  };

  watcher
    .on('add', (p) => handleFileChange(p, 'add'))
    .on('change', (p) => handleFileChange(p, 'change'))
    .on('unlink', (p) => handleFileChange(p, 'unlink'))
    .on('error', error => console.error(`[FileSync Watcher] Error: ${error}`))
    .on('ready', () => console.log(`[FileSync Watcher] Initial scan complete, ready for changes in ${directoryPath}.`));

  return watcher;
}

// Example placeholder DB service (replace with your actual implementation)
/*
const mockDbService = {
  getFilesByDirectoryId: async (inputDirId) => { console.log('DB: getFilesByDirectoryId', inputDirId); return []; },
  getFileByAbsolutePath: async (absolutePath) => { console.log('DB: getFileByAbsolutePath', absolutePath); return null; },
  insertFile: async (fileData) => { console.log('DB: insertFile', fileData); },
  updateFile: async (id, updates) => { console.log('DB: updateFile', id, updates); },
  updateFileByPath: async (absolutePath, updates) => { console.log('DB: updateFileByPath', absolutePath, updates); },
};
*/

// To use:
// const { scanInputDirectory, watchInputDirectory } = require('./fileSyncService');
// const watcher = await watchInputDirectory(1, '/path/to/watched/folder', actualDbServiceInstance);
// To stop watching: await watcher.close(); 