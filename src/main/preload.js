/* eslint-disable */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  window: {
    minimize: () => { console.log('minimize called'); ipcRenderer.send('window:minimize'); },
    maximize: () => { console.log('maximize called'); ipcRenderer.send('window:maximize'); },
    close: () => { console.log('close called'); ipcRenderer.send('window:close'); },
  },
  fileSystem: {
    selectDirectory: () => {
      console.log('selectDirectory called from preload.js');
      return ipcRenderer.invoke('dialog:selectDirectory')
    },
    saveProjectFile: (suggestedName) => {
      console.log('saveProjectFile called from preload.js', suggestedName);
      return ipcRenderer.invoke('dialog:saveProjectFile', suggestedName);
    },
  },
  data: {
    clearUserData: () => ipcRenderer.send('app:clearUserData'),
    createProject: (projectData) => {
      console.log('createProject called from preload.js with invoke', projectData);
      return ipcRenderer.invoke('app:createProject', projectData);
    },
    getAllInputDirectories: () => {
      console.log('getAllInputDirectories called from preload.js');
      return ipcRenderer.invoke('db:get-all-input-directories');
    },
    getFilesInDirectory: (directoryId) => {
      console.log(`getFilesInDirectory called from preload.js for dirId: ${directoryId}`);
      return ipcRenderer.invoke('db:get-files-in-directory', directoryId);
    },
  },
  onDbUpdated: (callback) => ipcRenderer.on('db-updated', (event, data) => callback(data)),
});

console.log('Preload script loaded.');
