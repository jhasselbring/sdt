# `libs` Directory

This directory contains shared libraries and utility modules for the main Electron process.

## What Belongs Here
- Reusable helper functions (e.g., data validation, file operations)
- IPC (Inter-Process Communication) handlers for Electron (e.g., dialogs, window controls, database access)
- Modules intended to be imported by multiple flows, services, or other main process modules

## What Does NOT Belong Here
- UI components (put those in `renderer/components/`)
- Business logic specific to a single flow (put those in [`flows/`](../flows/))
- Core business logic or reusable service modules (put those in [`services/`](../services/))
- Database schema or migration files (put those in `db/`)

## Typical Files
- `*Helpers.js`: General-purpose utility functions (e.g., `databaseHelpers.js`, `dataHelpers.js`)
- `*IpcHandlers.js`: IPC handler modules for Electron (e.g., `dialogIpcHandlers.js`, `windowIpcHandlers.js`, `databaseIpcHandlers.js`)

---
**Summary:**
If a module is a general-purpose helper or a shared IPC handler for the main process, it belongs here. For orchestration, use `flows/`. For core business logic, use `services/`.
