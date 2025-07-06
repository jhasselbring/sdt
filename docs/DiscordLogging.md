# Discord Logging Implementation

This document outlines the comprehensive Discord logging implementation for the SDT Dataset Preparer application.

## Overview

The application now includes extensive Discord logging for crucial lifecycle events, with clear indication of whether logs originate from the frontend (renderer) or backend (main) process.

## Log Format

All logs follow this format:
- **Emoji**: Visual indicator of log type/status
- **Process**: `[FRONTEND]` or `[BACKEND]` to clearly identify source
- **Message**: Descriptive message about the event
- **Metadata**: Additional context and data

## Backend (Main Process) Logging Points

### Application Lifecycle Events
- 🟢 **App Ready**: Application ready event triggered
- 🟢 **Window Created**: Main window created successfully
- 🟡 **App Activated**: Application activated (macOS)
- 🟡 **All Windows Closed**: All windows closed, quitting application
- 🔴 **Before Quit**: Application before-quit event triggered
- 🔴 **Will Quit**: Application will-quit event triggered
- ✅ **Shutdown Complete**: Application shutdown complete

### Window Management
- 🔄 **Creating Window**: Creating main window
- 📂 **Window State Loaded**: Window state loaded from file or defaults
- 🔄 **Window Off-screen**: Window was off-screen, centering
- 🟢 **BrowserWindow Created**: BrowserWindow instance created
- 🔧 **Loading Dev URL**: Loading development URL
- 📦 **Loading Production File**: Loading production file
- ✅ **Window Loaded**: Main window loaded successfully
- 🔄 **Window Closing**: Main window closing
- 🔄 **Saving Window State**: Saving window state
- ✅ **Window State Saved**: Window state saved successfully

### IPC Handler Registration
- 🔄 **Registering IPC Handlers**: Registering IPC handlers
- ✅ **IPC Handlers Registered**: IPC handlers registered successfully

### Database Operations
- 🔄 **Initializing Database**: Initializing database
- ✅ **Database Initialized**: Database initialized successfully
- 🔄 **File Sync Initialization**: Starting file sync initialization
- 🔄 **Found Input Directories**: Found input directories, starting sync
- 🔄 **Scanning Directory**: Scanning input directory
- ✅ **Directory Scan Complete**: Directory scan complete, initializing watcher
- ✅ **Directory Watcher Initialized**: Directory watcher initialized
- ℹ️ **No Input Directories**: No input directories found for sync
- 🔄 **Closing Database**: Closing database connection
- ✅ **Database Closed**: Database connection closed

### IPC Request Handling
- 🔄 **Database Operations**: Database run/get/all operations requested
- 🔄 **Get Input Directories**: Get all input directories requested
- 🔄 **Get Files in Directory**: Get files in directory requested
- 🔄 **Window Controls**: Window minimize/maximize/close requested
- 🔄 **Dialog Operations**: Directory selection, save project file, open file dialogs requested
- 🔄 **Clear User Data**: Clear user data requested
- ✅ **User Data Cleared**: User data cleared successfully
- 🔄 **Create Project**: Create project requested

### Project Management
- 🔄 **Creating New Project**: Creating new project
- ✅ **Project Data Validated**: Project data validated
- ✅ **Project File Created**: Project file created

## Frontend (Renderer Process) Logging Points

### React Application Lifecycle
- 🟢 **React Renderer Starting**: React renderer starting
- ✅ **React Renderer Mounted**: React renderer mounted successfully

### App Component Lifecycle
- 🔄 **App Component Initializing**: App component initializing
- ✅ **App Component Initialized**: App component initialized with Header and Nav
- 🔄 **Input Directory Polling**: Starting input directory polling
- ✅ **Input Directories Found**: Input directories found, mounting InputFileViewer
- 🔄 **Input Directory Polling Stopped**: Input directory polling stopped

### Context Management
- 🟢 **AppContext Provider Initialized**: AppContext provider initialized
- 🔄 **Mounting Component**: Mounting component
- ✅ **Component Mounted**: Component mounted successfully
- 🔄 **Updating State from DB**: Updating state from database
- ✅ **State Updated from DB**: State updated from database successfully

## Log Levels

The system supports four log levels:
- **info**: General information and successful operations
- **warn**: Warning messages for potential issues
- **error**: Error messages with stack traces
- **debug**: Debug information (if enabled)

## Configuration

Logging is configured in `src/main/config/discordConfig.js`:
- **enabled**: Whether Discord logging is active
- **allowedLevels**: Which log levels to send to Discord
- **rateLimitDelay**: Delay between log messages (ms)
- **maxQueueSize**: Maximum queue size before dropping logs

## Frontend Logger Utility

The frontend uses a dedicated logging utility (`src/renderer/utils/frontendLogger.js`) that:
- Sends logs to the main process via IPC
- Automatically adds process identification and timestamps
- Handles errors gracefully if Discord logging fails
- Provides convenience methods for all log levels

## Error Handling

All logging operations include error handling:
- Failed Discord webhook calls are logged to console
- Frontend logging failures don't break the application
- Database logging errors are captured and logged
- IPC communication failures are handled gracefully

## Usage Examples

### Backend Logging
```javascript
await discordLogger.info('🟢 [BACKEND] Operation completed', { 
  context: 'myFunction',
  process: 'main',
  additionalData: 'value'
});
```

### Frontend Logging
```javascript
import frontendLogger from './utils/frontendLogger.js';

await frontendLogger.info('🟢 [FRONTEND] Component mounted', { 
  context: 'MyComponent',
  process: 'renderer',
  componentName: 'MyComponent'
});
```

## Monitoring

All logs are sent to the configured Discord webhook, providing real-time monitoring of:
- Application startup and shutdown
- User interactions and navigation
- Database operations and file system changes
- Error conditions and debugging information
- Performance metrics and timing data

This comprehensive logging system ensures complete visibility into the application's lifecycle and helps with debugging, monitoring, and user support. 