import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { initializeDatabase, run, get, all, closeDb } from './database.js';
import isDev from 'electron-is-dev';
import fs from 'node:fs';

const checkSquirrelStartup = async () => {
  try {
    const squirrel = await import('electron-squirrel-startup');
    if (squirrel.default) {
      app.quit();
    }
  } catch (e) {
    // Module not found, do nothing
  }
};
await checkSquirrelStartup();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') {
  app.setAppUserModelId('com.example.datasetpreparer');
}

let mainWindowRef;
const windowStatePath = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState() {
  try {
    if (fs.existsSync(windowStatePath)) {
      return JSON.parse(fs.readFileSync(windowStatePath, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load window state:', e);
  }
  return { width: 800, height: 600 };
}

function saveWindowState(win) {
  if (!win) return;
  const bounds = win.getBounds();
  try {
    fs.writeFileSync(windowStatePath, JSON.stringify(bounds));
  } catch (e) {
    console.error('Failed to save window state:', e);
  }
}

const createWindow = async () => {
  const state = loadWindowState();
  const mainWindow = new BrowserWindow({
    width: state.width || 800,
    height: state.height || 600,
    x: state.x,
    y: state.y,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  mainWindowRef = mainWindow;

  mainWindow.on('close', () => saveWindowState(mainWindow));

  // Load the index.html of the app.
  if (isDev) {
    // In development, load from Vite dev server
    await mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production, load the built files
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  // Initialize the database only when a project is created or opened.
  // initializeDatabase(path.join(app.getPath('userData'), 'sdt.sqlite'));
});

// IPC handlers for database operations
ipcMain.handle('db:run', async (_, sql, params) => {
  try {
    const result = await run(sql, params);
    return { success: true, data: result };
  } catch (error) {
    console.error('Database run error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
});

ipcMain.handle('db:get', async (_, sql, params) => {
  try {
    const result = await get(sql, params);
    return { success: true, data: result };
  } catch (error) {
    console.error('Database get error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
});

ipcMain.handle('db:all', async (_, sql, params) => {
  try {
    const result = await all(sql, params);
    return { success: true, data: result };
  } catch (error) {
    console.error('Database all error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
});

// Window control IPC handlers
ipcMain.on('window:minimize', () => {
  console.log('window:minimize received');
  if (mainWindowRef) {
    mainWindowRef.minimize();
  } else {
    console.log('mainWindowRef is undefined');
  }
});
ipcMain.on('window:close', () => {
  console.log('window:close received');
  if (mainWindowRef) {
    mainWindowRef.close();
  } else {
    console.log('mainWindowRef is undefined');
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app quit to close the database connection
app.on('will-quit', () => {
  closeDb();
});