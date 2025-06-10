## Inter Process Communication
1. Define the function in electron (InterProcess.js) like so:
```javascript
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
  ```
  ### Note the name of the event:
`app:clearUserData` needs to match the name of the event in step #2

2. Make it available to the frontend via preload.js like so:
```javascript
clearUserData: () => ipcRenderer.send('app:clearUserData')
```

3. Trigger it from the UI or any other logic:
```javascript
<button onClick={() => { window.electronAPI?.clearUserData?.(); }}>Button</button>
 ```