import { dialog } from 'electron';

/**
 * Dialog IPC Handlers
 * These functions handle dialog-related IPC events for Electron apps.
 * Pass a mainWindowGetter function to get the current BrowserWindow instance.
 */

/**
 * Returns a handler to open a directory selection dialog.
 */
export function createSelectDirectoryHandler(mainWindowGetter) {
  return async () => {
    const win = mainWindowGetter();
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: 'Select Directory',
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  };
}

/**
 * Returns a handler to open a save dialog for project files.
 * @param {Function} mainWindowGetter
 */
export function createSaveProjectFileHandler(mainWindowGetter) {
  return async (_event, suggestedName) => {
    const win = mainWindowGetter();
    const result = await dialog.showSaveDialog(win, {
      title: 'Save Project File',
      defaultPath: suggestedName,
      filters: [{ name: 'SDT Project', extensions: ['sdt'] }],
    });
    if (result.canceled) return null;
    return result.filePath;
  };
}

/**
 * Returns a handler to open a file dialog for opening project files.
 * @param {Function} mainWindowGetter
 */
export function createOpenFileHandler(mainWindowGetter) {
  return async (_event, options = {}) => {
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
  };
} 