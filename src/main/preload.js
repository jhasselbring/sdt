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
    openFile: (options) => {
      console.log('openFile called from preload.js', options);
      return ipcRenderer.invoke('dialog:openFile', options);
    },
  },
  data: {
    clearUserData: () => ipcRenderer.send('app:clearUserData'),
    createProject: async (projectData) => {
      const result = await ipcRenderer.invoke('app:createProject', projectData);
      console.log(result, 'result from preload.js');
      return result;
    },
    getAllInputDirectories: () => {
      console.log('getAllInputDirectories called from preload.js');
      // return ipcRenderer.invoke('db:get-all-input-directories');
    },
    getFilesInDirectory: (directoryId) => {
      console.log(`getFilesInDirectory called from preload.js for dirId: ${directoryId}`);
      return ipcRenderer.invoke('db:get-files-in-directory', directoryId);
    },
  },
  discord: {
    log: (message, level = 'info', metadata = {}) => {
      console.log('Discord log called from preload.js:', message, level, metadata);
      return ipcRenderer.invoke('discord:log', message, level, metadata);
    },
    logError: (error, context = {}) => {
      console.log('Discord logError called from preload.js:', error, context);
      return ipcRenderer.invoke('discord:logError', error, context);
    },
  },
  onDbUpdated: (callback) => ipcRenderer.on('db-updated', (event, data) => callback(data)),
});

console.log('Preload script loaded.');
