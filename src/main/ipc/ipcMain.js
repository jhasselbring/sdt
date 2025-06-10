// InterProcess.js
//
// Registers all IPC handlers for the Electron main process.
// Handler logic is separated into libs and logicFlow for maintainability.
// New developers: See the imported files for handler logic and documentation.

import { ipcMain, app } from 'electron';
import fs from 'node:fs';
import path from 'path';
import {
  handleDbRun,
  handleDbGet,
  handleDbAll,
  handleGetAllInputDirectories,
  handleGetFilesInDirectory
} from '../libs/databaseIpcHandlers.js';
import {
  createMinimizeHandler,
  createCloseHandler,
  createMaximizeHandler
} from '../libs/windowIpcHandlers.js';
import {
  createSelectDirectoryHandler,
  createSaveProjectFileHandler,
  createOpenFileHandler
} from '../libs/dialogIpcHandlers.js';
import projectController from '../controllers/projectController.js';

let mainWindowRef = null;

/**
 * Registers all IPC handlers for the main process.
 * @param {Function} mainWindowGetter - Returns the current BrowserWindow instance.
 */
export function registerIpcHandlers(mainWindowGetter) {
  // Database handlers
  ipcMain.handle('db:run', handleDbRun);
  ipcMain.handle('db:get', handleDbGet);
  ipcMain.handle('db:all', handleDbAll);
  ipcMain.handle('db:get-all-input-directories', handleGetAllInputDirectories);
  ipcMain.handle('db:get-files-in-directory', handleGetFilesInDirectory);

  // Window control handlers
  ipcMain.on('window:minimize', createMinimizeHandler(mainWindowGetter));
  ipcMain.on('window:close', createCloseHandler(mainWindowGetter));
  ipcMain.on('window:maximize', createMaximizeHandler(mainWindowGetter));

  // Dialog handlers
  ipcMain.handle('dialog:selectDirectory', createSelectDirectoryHandler(mainWindowGetter));
  ipcMain.handle('dialog:saveProjectFile', createSaveProjectFileHandler(mainWindowGetter));
  ipcMain.handle('dialog:openFile', createOpenFileHandler(mainWindowGetter));

  // App/project logic
  ipcMain.on('app:clearUserData', () => {
    // Clears Electron user data and relaunches the app.
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

  ipcMain.handle('app:createProject', async (_event, projectData) => {
    return projectController.createNewAndLoadProject(projectData);
  });
}

/**
 * Sets a reference to the main window (for legacy use).
 * @param {any} ref
 */
export function setMainWindowRef(ref) {
  mainWindowRef = ref;
}
