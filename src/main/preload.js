/* eslint-disable */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  window: {
    minimize: () => { console.log('minimize called'); ipcRenderer.send('window:minimize'); },
    maximize: () => { console.log('maximize called'); ipcRenderer.send('window:maximize'); },
    close: () => { console.log('close called'); ipcRenderer.send('window:close'); },
  },
  clearUserData: () => ipcRenderer.send('app:clearUserData'),
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