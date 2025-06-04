/* eslint-disable */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  window: {
    minimize: () => { console.log('minimize called'); ipcRenderer.send('window:minimize'); },
    maximize: () => { console.log('maximize called'); ipcRenderer.send('window:maximize'); },
    close: () => { console.log('close called'); ipcRenderer.send('window:close'); },
  },
  clearUserData: () => ipcRenderer.send('app:clearUserData'),
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
});

console.log('Preload script loaded.');
