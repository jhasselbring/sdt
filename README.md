# SDT - Dataset Preparer

An Electron-based desktop application for preparing and managing datasets with file synchronization capabilities.

## Features
- File synchronization and monitoring
- SQLite database integration
- Modular component architecture
- Cross-platform support (Windows, macOS, Linux)

## Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup
```bash
npm install
```

### Development Mode
```bash
npm run dev:electron
```

### Build
```bash
npm run build
```

### Database Rebuild (if needed)
```bash
npm run rebuild
```

## Project Structure
- `src/main/` - Electron main process
- `src/renderer/` - React frontend
- `src/main/controllers/` - Business logic flows
- `src/main/services/` - Core services
- `src/main/libs/` - Utility functions

## IPC Communication
See `docs/Docs.md` for Inter-Process Communication patterns.
