import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { initializeDatabase, run, get, all, closeDb } from './tmp/database.js';
import isDev from 'electron-is-dev';
import fs from 'node:fs';
import { registerIpcHandlers } from './ipc/ipcMain.js';
import discordLogger from './services/discordLoggerService.js';

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

async function loadWindowState() {
  try {
    await discordLogger.info('🔄 [BACKEND] Loading window state', { 
      context: 'loadWindowState',
      process: 'main',
      windowStatePath
    });
    
    if (fs.existsSync(windowStatePath)) {
      const state = JSON.parse(fs.readFileSync(windowStatePath, 'utf8'));
      await discordLogger.info('✅ [BACKEND] Window state loaded from file', { 
        context: 'loadWindowState',
        process: 'main',
        state
      });
      return state;
    }
    
    await discordLogger.info('ℹ️ [BACKEND] No saved window state found, using defaults', { 
      context: 'loadWindowState',
      process: 'main'
    });
  } catch (e) {
    await discordLogger.logError(e, { context: 'loadWindowState' });
    console.error('Failed to load window state:', e);
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const bounds = primaryDisplay.workArea;
  const defaultState = { width: bounds.width, height: bounds.height, x: bounds.x, y: bounds.y };
  
  await discordLogger.info('✅ [BACKEND] Using default window state', { 
    context: 'loadWindowState',
    process: 'main',
    defaultState
  });
  
  return defaultState;
}

async function saveWindowState(win) {
  if (!win) return;
  const bounds = win.getBounds();
  try {
    await discordLogger.info('🔄 [BACKEND] Saving window state', { 
      context: 'saveWindowState',
      process: 'main',
      bounds
    });
    
    fs.writeFileSync(windowStatePath, JSON.stringify(bounds));
    
    await discordLogger.info('✅ [BACKEND] Window state saved successfully', { 
      context: 'saveWindowState',
      process: 'main',
      bounds
    });
  } catch (e) {
    await discordLogger.logError(e, { context: 'saveWindowState', bounds });
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
  try {
    await discordLogger.info('🔄 [BACKEND] Creating main window', { 
      context: 'createWindow',
      process: 'main'
    });
    
    const state = await loadWindowState();
    await discordLogger.info('📂 [BACKEND] Window state loaded', { 
      context: 'createWindow',
      process: 'main',
      state
    });

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
      await discordLogger.info('🔄 [BACKEND] Window was off-screen, centering', { 
        context: 'createWindow',
        process: 'main'
      });
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

    await discordLogger.info('🟢 [BACKEND] BrowserWindow created', { 
      context: 'createWindow',
      process: 'main',
      windowOptions
    });

    mainWindow.on('close', async () => {
      await discordLogger.info('🟡 [BACKEND] Main window closing', { 
        context: 'mainWindow.close',
        process: 'main'
      });
      await saveWindowState(mainWindow);
    });

    if (isDev) {
      await discordLogger.info('🔧 [BACKEND] Loading development URL', { 
        context: 'createWindow',
        process: 'main',
        environment: 'development'
      });
      await mainWindow.loadURL('http://localhost:3000');
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
      await discordLogger.info('📦 [BACKEND] Loading production file', { 
        context: 'createWindow',
        process: 'main',
        environment: 'production'
      });
      await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    await discordLogger.info('✅ [BACKEND] Main window loaded successfully', { 
      context: 'createWindow',
      process: 'main'
    });
  } catch (error) {
    await discordLogger.logError(error, { context: 'createWindow' });
    throw error;
  }
};

// Register IPC handlers and pass a getter for mainWindowRef
try {
  await discordLogger.info('🔄 [BACKEND] Registering IPC handlers', { 
    context: 'registerIpcHandlers',
    process: 'main'
  });
  registerIpcHandlers(() => mainWindowRef);
  await discordLogger.info('✅ [BACKEND] IPC handlers registered successfully', { 
    context: 'registerIpcHandlers',
    process: 'main'
  });
} catch (error) {
  await discordLogger.logError(error, { context: 'registerIpcHandlers' });
  console.error('Failed to register IPC handlers:', error);
}

app.on('ready', async () => {
  try {
    await discordLogger.info('🟢 [BACKEND] Application ready event triggered', { 
      context: 'app.ready',
      process: 'main'
    });
    await discordLogger.logStartup();
    await createWindow();
    await discordLogger.info('🟢 [BACKEND] Main window created successfully', { 
      context: 'createWindow',
      process: 'main'
    });
  } catch (error) {
    await discordLogger.logError(error, { context: 'app.ready' });
    console.error('Failed to start application:', error);
  }
});

app.on('window-all-closed', async () => {
  await discordLogger.info('🟡 [BACKEND] All windows closed, quitting application', { 
    context: 'window-all-closed',
    process: 'main'
  });
  app.quit();
});

app.on('activate', async () => {
  await discordLogger.info('🟡 [BACKEND] Application activated', { 
    context: 'app.activate',
    process: 'main',
    windowCount: BrowserWindow.getAllWindows().length
  });
  if (BrowserWindow.getAllWindows().length === 0) {
    await discordLogger.info('🟢 [BACKEND] No windows found, creating new window', { 
      context: 'app.activate',
      process: 'main'
    });
    createWindow();
  }
});

app.on('before-quit', async () => {
  await discordLogger.info('🔴 [BACKEND] Application before-quit event triggered', { 
    context: 'app.before-quit',
    process: 'main'
  });
  // This event is emitted when the application is about to quit
  // It's useful for cleanup operations
});

app.on('will-quit', async () => {
  try {
    await discordLogger.info('🔴 [BACKEND] Application will-quit event triggered', { 
      context: 'app.will-quit',
      process: 'main'
    });
    await discordLogger.logShutdown();
    await discordLogger.info('🔄 [BACKEND] Closing database connection', { 
      context: 'app.will-quit',
      process: 'main'
    });
    closeDb();
    await discordLogger.info('✅ [BACKEND] Database connection closed', { 
      context: 'app.will-quit',
      process: 'main'
    });
  } catch (error) {
    await discordLogger.logError(error, { context: 'app.will-quit' });
    console.error('Error during shutdown:', error);
  }
});
