import { app, BrowserWindow, ipcMain, screen } from 'electron';
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

  const primaryDisplay = screen.getPrimaryDisplay();
  const bounds = primaryDisplay.workArea;
  return { width: bounds.width, height: bounds.height, x: bounds.x, y: bounds.y };
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

// ✅ Added: Check if the stored window position is off-screen
function isWindowOffScreen(bounds) {
  const displays = screen.getAllDisplays();
  return !displays.some(display => {
    const d = display.workArea;
    return (
      bounds.x >= d.x &&
      bounds.y >= d.y &&
      bounds.x + bounds.width <= d.x + d.width &&
      bounds.y + bounds.height <= d.y + d.height
    );
  });
}

const createWindow = async () => {
  const state = loadWindowState();

  let windowOptions = {
    width: state.width || 800,
    height: state.height || 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  };

  // ✅ Added: If off-screen, center the window
  if (isWindowOffScreen(state)) {
    windowOptions.center = true;
  } else {
    windowOptions = {
      ...windowOptions,
      x: state.x,
      y: state.y,
    };
  }

  const mainWindow = new BrowserWindow(windowOptions);
  mainWindowRef = mainWindow;

  mainWindow.on('close', () => saveWindowState(mainWindow));

  if (isDev) {
    await mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
};

app.on('ready', () => {
  createWindow();
});

// IPC handlers for database operations
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

// Window control IPC handlers
ipcMain.on('window:minimize', () => {
  console.log('window:minimize received');
  mainWindowRef?.minimize();
});
ipcMain.on('window:close', () => {
  console.log('window:close received');
  mainWindowRef?.close();
});
ipcMain.on('window:maximize', () => {
  console.log('window:maximize received');
  if (mainWindowRef) {
    mainWindowRef.isMaximized() ? mainWindowRef.unmaximize() : mainWindowRef.maximize();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  closeDb();
});

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
