import { ipcMain, app, dialog } from 'electron';
import path from 'path';
import {
  run, get, all, closeDb, initializeProjectDatabase,
  getFilesByDirectoryId, getFileByAbsolutePath, insertFile, updateFile, updateFileByPath
} from './database.js';
import fs from 'node:fs';
import { scanInputDirectory, watchInputDirectory } from './services/fileSyncService.js';

let mainWindowRef = null;

export function registerIpcHandlers(mainWindowGetter) {
  // Database operations
  ipcMain.handle('db:run', async (_, sql, params) => {
    try {
      const result = await run(sql, params);
      return { success: true, data: result };
    } catch (error) {
      console.error('Database run error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle('db:get', async (_, sql, params) => {
    try {
      const result = await get(sql, params);
      return { success: true, data: result };
    } catch (error) {
      console.error('Database get error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle('db:all', async (_, sql, params) => {
    try {
      const result = await all(sql, params);
      return { success: true, data: result };
    } catch (error) {
      console.error('Database all error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Window control
  ipcMain.on('window:minimize', () => {
    console.log('window:minimize received');
    const win = mainWindowGetter();
    win?.minimize();
  });
  ipcMain.on('window:close', () => {
    console.log('window:close received');
    const win = mainWindowGetter();
    win?.close();
  });
  ipcMain.on('window:maximize', () => {
    console.log('window:maximize received');
    const win = mainWindowGetter();
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize();
    }
  });

  // Clear user data
  ipcMain.on('app:clearUserData', () => {
    const userData = app.getPath('userData');
    try {
      fs.rmSync(userData, { recursive: true, force: true });
      console.log('Cleared userData directory:', userData);
    } catch (e) {
      console.error('Failed to clear userData:', e);
    }
    app.relaunch();
    app.exit();
  });

  ipcMain.handle('dialog:selectDirectory', async (event) => {
    const win = mainWindowGetter();
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: 'Select Directory',
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('dialog:saveProjectFile', async (event, suggestedName) => {
    const win = mainWindowGetter();
    const result = await dialog.showSaveDialog(win, {
      title: 'Save Project File',
      defaultPath: suggestedName,
      filters: [{ name: 'SDT Project', extensions: ['sdt'] }],
    });
    if (result.canceled) return null;
    return result.filePath;
  });

  ipcMain.handle('app:createProject', async (event, projectData) => {
    const { inputDir, maxHeight, maxWidth, name, outputDir, projectSaveLocation } = projectData;

    // Validate required fields
    if (!inputDir?.trim() || !fs.existsSync(inputDir)) {
      return { success: false, error: 'Input directory is required and must exist' };
    }
    if (!outputDir?.trim() || !fs.existsSync(outputDir)) {
      return { success: false, error: 'Output directory is required and must exist' };
    }
    if (!projectSaveLocation?.trim() || !fs.existsSync(path.dirname(projectSaveLocation))) {
      return { success: false, error: 'Project save location is required and parent directory must exist' };
    }
    if (!name?.trim()) {
      return { success: false, error: 'Project name is required' };
    }
    if (!maxHeight || isNaN(maxHeight) || maxHeight <= 0) {
      return { success: false, error: 'Max height must be a positive number' };
    }
    if (!maxWidth || isNaN(maxWidth) || maxWidth <= 0) {
      return { success: false, error: 'Max width must be a positive number' };
    }

    if (fs.existsSync(projectSaveLocation)) {
      return { success: false, error: 'Project file already exists. Please choose a different location or change the file name.' };
    }
    // No need to create a directory, just write the file
    try {
      // Create project config (metadata for the database)
      const projectMetadata = {
        name,
        inputDir,
        outputDir,
        maxHeight,
        maxWidth,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await initializeProjectDatabase(projectSaveLocation, projectMetadata);
      
      // ---- BEGIN FILE SYNC INITIALIZATION ----
      // const dbService = {
      //   getFilesByDirectoryId,
      //   getFileByAbsolutePath,
      //   insertFile,
      //   updateFile,
      //   updateFileByPath,
      // };
      // 
      // const inputDirectoryPath = projectMetadata.inputDir;
      // 
      // if (inputDirectoryPath && typeof inputDirectoryPath === 'string') {
      //   try {
      //     const dirRecord = await get('SELECT id FROM input_directories WHERE path = ?', [inputDirectoryPath]);
      // 
      //     if (dirRecord && dirRecord.id) {
      //       const inputDirId = dirRecord.id;
      //       console.log(`[InterProcess] Starting initial scan for ${inputDirectoryPath} (ID: ${inputDirId})`);
      //       await scanInputDirectory(inputDirId, inputDirectoryPath, dbService);
      //       console.log(`[InterProcess] Scan complete for ${inputDirectoryPath}. Initializing watcher...`);
      //       
      //       watchInputDirectory(inputDirId, inputDirectoryPath, dbService)
      //         .then(watcherInstance => {
      //           console.log(`[InterProcess] Watcher successfully initialized for ${inputDirectoryPath}`);
      //         })
      //         .catch(watchError => {
      //           console.error(`[InterProcess] Error initializing watcher for ${inputDirectoryPath}:`, watchError);
      //         });
      // 
      //     } else {
      //       console.error(`[InterProcess] Could not find DB record for input directory: ${inputDirectoryPath} after project initialization. File sync might not work.`);
      //     }
      //   } catch (syncError) {
      //     console.error(`[InterProcess] Error during file sync setup for ${inputDirectoryPath}:`, syncError);
      //   }
      // } else {
      //   console.warn('[InterProcess] No valid inputDir (string) specified in projectMetadata during project creation. Skipping file sync setup.');
      // }
      // ---- END FILE SYNC INITIALIZATION ----

      // console.log('Project database created successfully at:', projectSaveLocation); // Log moved to initializeDatabase
      return { success: true, data: { projectSaveLocation } };
    } catch (error) {
      console.error('Failed to create project database:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create project database' };
    }
  });

  // ---- BEGIN NEW IPC HANDLERS FOR InputFileViewer ----
  ipcMain.handle('db:get-all-input-directories', async () => {
    try {
      const dirs = await all('SELECT id, path FROM input_directories ORDER BY path');
      return { success: true, data: dirs };
    } catch (error) {
      console.error('Error fetching all input directories:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:get-files-in-directory', async (_, directoryId) => {
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
  });

  ipcMain.handle('dialog:openFile', async (event, options = {}) => {
    const win = mainWindowGetter();
    const result = await dialog.showOpenDialog(win, {
      title: 'Open Project File',
      properties: ['openFile'],
      filters: [
        { name: 'SQLite Project Files', extensions: ['sqlite', 'db', 'sdt'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      ...options
    });
    if (result.canceled) return { canceled: true };
    return { canceled: false, filePaths: result.filePaths };
  });
  // ---- END NEW IPC HANDLERS FOR InputFileViewer ----
}

export function setMainWindowRef(ref) {
  mainWindowRef = ref;
}
