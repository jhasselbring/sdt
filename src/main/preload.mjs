/* eslint-disable */
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Expose database IPC handlers
  db: {
    run: (sql, params) => ipcRenderer.invoke('db:run', sql, params),
    get: (sql, params) => ipcRenderer.invoke('db:get', sql, params),
    all: (sql, params) => ipcRenderer.invoke('db:all', sql, params),
    transaction: (fnName, ...args) => ipcRenderer.invoke('db:transaction', fnName, ...args),
  },
  // You can expose other APIs here, like sending messages or listening to events
  // send: (channel, data) => ipcRenderer.send(channel, data),
  // on: (channel, func) => {
  //   const subscription = (event, ...args) => func(...args);
  //   ipcRenderer.on(channel, subscription);
  //   return () => ipcRenderer.removeListener(channel, subscription);
  // }
});

console.log('Preload script loaded.');

// It's a good practice to also define the types for your exposed API
// You can create a global.d.ts or similar in your src/ folder for this
// e.g.:
// declare global {
//   interface Window {
//     electronAPI: {
//       invoke: (channel: string, ...args: any[]) => Promise<any>;
//     };
//   }
// }

// This file uses ESM syntax. If you encounter issues, rename to preload.mjs and update your Electron main process to load it as a module.