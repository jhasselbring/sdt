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
import discordLogger from '../services/discordLoggerService.js';

let mainWindowRef = null;

/**
 * Registers all IPC handlers for the main process.
 * @param {Function} mainWindowGetter - Returns the current BrowserWindow instance.
 */
export function registerIpcHandlers(mainWindowGetter) {
  // Database handlers
  ipcMain.handle('db:run', async (event, ...args) => {
    await discordLogger.info('🔄 [BACKEND] Database run operation requested', { 
      context: 'ipc.db:run',
      process: 'main'
    });
    return databaseIpcHandlers.handleDbRun(event, ...args);
  });
  
  ipcMain.handle('db:get', async (event, ...args) => {
    await discordLogger.info('🔄 [BACKEND] Database get operation requested', { 
      context: 'ipc.db:get',
      process: 'main'
    });
    return databaseIpcHandlers.handleDbGet(event, ...args);
  });
  
  ipcMain.handle('db:all', async (event, ...args) => {
    await discordLogger.info('🔄 [BACKEND] Database all operation requested', { 
      context: 'ipc.db:all',
      process: 'main'
    });
    return databaseIpcHandlers.handleDbAll(event, ...args);
  });
  
  ipcMain.handle('db:get-all-input-directories', async (event, ...args) => {
    await discordLogger.info('🔄 [BACKEND] Get all input directories requested', { 
      context: 'ipc.db:get-all-input-directories',
      process: 'main'
    });
    return databaseIpcHandlers.handleGetAllInputDirectories(event, ...args);
  });
  
  ipcMain.handle('db:get-files-in-directory', async (event, ...args) => {
    await discordLogger.info('🔄 [BACKEND] Get files in directory requested', { 
      context: 'ipc.db:get-files-in-directory',
      process: 'main',
      directoryId: args[0]
    });
    return databaseIpcHandlers.handleGetFilesInDirectory(event, ...args);
  });

  // Window control handlers
  ipcMain.on('window:minimize', async (event, ...args) => {
    await discordLogger.info('🔄 [BACKEND] Window minimize requested', { 
      context: 'ipc.window:minimize',
      process: 'main'
    });
    windowIpcHandlers.createMinimizeHandler(mainWindowGetter)(event, ...args);
  });
  
  ipcMain.on('window:maximize', async (event, ...args) => {
    await discordLogger.info('🔄 [BACKEND] Window maximize requested', { 
      context: 'ipc.window:maximize',
      process: 'main'
    });
    windowIpcHandlers.createMaximizeHandler(mainWindowGetter)(event, ...args);
  });
  
  ipcMain.on('window:close', async (event, ...args) => {
    await discordLogger.info('🔄 [BACKEND] Window close requested', { 
      context: 'ipc.window:close',
      process: 'main'
    });
    windowIpcHandlers.createCloseHandler(mainWindowGetter)(event, ...args);
  });

  // Dialog handlers
  ipcMain.handle('dialog:selectDirectory', async (event, ...args) => {
    await discordLogger.info('🔄 [BACKEND] Directory selection dialog requested', { 
      context: 'ipc.dialog:selectDirectory',
      process: 'main'
    });
    return dialogIpcHandlers.createSelectDirectoryHandler(mainWindowGetter)(event, ...args);
  });
  
  ipcMain.handle('dialog:saveProjectFile', async (event, ...args) => {
    await discordLogger.info('🔄 [BACKEND] Save project file dialog requested', { 
      context: 'ipc.dialog:saveProjectFile',
      process: 'main',
      suggestedName: args[0]
    });
    return dialogIpcHandlers.createSaveProjectFileHandler(mainWindowGetter)(event, ...args);
  });
  
  ipcMain.handle('dialog:openFile', async (event, ...args) => {
    await discordLogger.info('🔄 [BACKEND] Open file dialog requested', { 
      context: 'ipc.dialog:openFile',
      process: 'main',
      options: args[0]
    });
    return dialogIpcHandlers.createOpenFileHandler(mainWindowGetter)(event, ...args);
  });

  // App/project logic
  ipcMain.on('app:clearUserData', async () => {
    await discordLogger.info('🔄 [BACKEND] Clear user data requested', { 
      context: 'ipc.app:clearUserData',
      process: 'main'
    });
    // Clears Electron user data and relaunches the app.
    const userData = app.getPath('userData');
    try {
      fs.rmSync(userData, { recursive: true, force: true });
      await discordLogger.info('✅ [BACKEND] User data cleared successfully', { 
        context: 'ipc.app:clearUserData',
        process: 'main',
        userDataPath: userData
      });
      console.log('Cleared userData directory:', userData);
    } catch (e) {
      await discordLogger.logError(e, { context: 'ipc.app:clearUserData' });
      console.error('Failed to clear userData:', e);
    }
    app.relaunch();
    app.exit();
  });

  ipcMain.handle('app:createProject', async (_event, projectData) => {
    await discordLogger.info('🔄 [BACKEND] Create project requested', { 
      context: 'ipc.app:createProject',
      process: 'main',
      projectData
    });
    return projectController.createNewAndLoadProject(projectData);
  });

  // Discord logging handlers
  ipcMain.handle('discord:log', async (_event, message, level = 'info', metadata = {}) => {
    try {
      await discordLogger.log(message, level, metadata);
      return { success: true };
    } catch (error) {
      console.error('Failed to log to Discord:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('discord:logError', async (_event, error, context = {}) => {
    try {
      await discordLogger.logError(error, context);
      return { success: true };
    } catch (logError) {
      console.error('Failed to log error to Discord:', logError);
      return { success: false, error: logError.message };
    }
  });
}

/**
 * Sets a reference to the main window (for legacy use).
 * @param {any} ref
 */
export function setMainWindowRef(ref) {
  mainWindowRef = ref;
}
