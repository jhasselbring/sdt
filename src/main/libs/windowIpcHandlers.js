/**
 * Window Control IPC Handlers
 * These functions handle window control events (minimize, close, maximize) for Electron apps.
 * Pass a mainWindowGetter function to get the current BrowserWindow instance.
 */

/**
 * Returns a handler to minimize the main window.
 */
export function createMinimizeHandler(mainWindowGetter) {
  return () => {
    const win = mainWindowGetter();
    win?.minimize();
  };
}

/**
 * Returns a handler to close the main window.
 */
export function createCloseHandler(mainWindowGetter) {
  return () => {
    const win = mainWindowGetter();
    win?.close();
  };
}

/**
 * Returns a handler to toggle maximize/unmaximize the main window.
 */
export function createMaximizeHandler(mainWindowGetter) {
  return () => {
    const win = mainWindowGetter();
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize();
    }
  };
} 


export default {
  createMinimizeHandler,
  createCloseHandler,
  createMaximizeHandler
};