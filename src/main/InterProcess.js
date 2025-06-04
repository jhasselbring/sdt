import { ipcMain, app } from 'electron';
import { run, get, all, closeDb } from './database.js';
import fs from 'node:fs';

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
}

export function setMainWindowRef(ref) {
  mainWindowRef = ref;
}
