// InterProcess.js
//
// Registers all IPC handlers for the Electron main process.
// Handler logic is separated into libs and logicFlow for maintainability.
// New developers: See the imported files for handler logic and documentation.

import { ipcMain, app } from 'electron';
import fs from 'node:fs';
import path from 'path';
import databaseIpcHandlers from '../libs/databaseIpcHandlers.js';
import windowIpcHandlers from '../libs/windowIpcHandlers.js';
import dialogIpcHandlers from '../libs/dialogIpcHandlers.js';
import projectController from '../controllers/projectController.js';

let mainWindowRef = null;

/**
 * Registers all IPC handlers for the main process.
 * @param {Function} mainWindowGetter - Returns the current BrowserWindow instance.
 */
export function registerIpcHandlers(mainWindowGetter) {
  // Database handlers
  ipcMain.handle('db:run', databaseIpcHandlers.handleDbRun);
  ipcMain.handle('db:get', databaseIpcHandlers.handleDbGet);
  ipcMain.handle('db:all', databaseIpcHandlers.handleDbAll);
  ipcMain.handle('db:get-all-input-directories', databaseIpcHandlers.handleGetAllInputDirectories);
  ipcMain.handle('db:get-files-in-directory', databaseIpcHandlers.handleGetFilesInDirectory);

  // Window control handlers
  ipcMain.on('window:minimize', windowIpcHandlers.createMinimizeHandler(mainWindowGetter));
  ipcMain.on('window:close', windowIpcHandlers.createCloseHandler(mainWindowGetter));
  ipcMain.on('window:maximize', windowIpcHandlers.createMaximizeHandler(mainWindowGetter));

  // Dialog handlers
  ipcMain.handle('dialog:selectDirectory', dialogIpcHandlers.createSelectDirectoryHandler(mainWindowGetter));
  ipcMain.handle('dialog:saveProjectFile', dialogIpcHandlers.createSaveProjectFileHandler(mainWindowGetter));
  ipcMain.handle('dialog:openFile', dialogIpcHandlers.createOpenFileHandler(mainWindowGetter));

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
