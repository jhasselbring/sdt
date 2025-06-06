import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { initializeDatabase, run, get, all, closeDb } from './database.js';
import isDev from 'electron-is-dev';
import fs from 'node:fs';
import { registerIpcHandlers } from './InterProcess.js';

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
global.mainWindowRef = null;
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
  global.mainWindowRef = mainWindow;

  mainWindow.on('close', () => saveWindowState(mainWindow));

  if (isDev) {
    await mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
};

// Register IPC handlers and pass a getter for mainWindowRef
registerIpcHandlers(() => mainWindowRef);

app.on('ready', () => {
  createWindow();
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
