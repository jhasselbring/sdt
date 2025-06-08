# `services` Directory

This directory contains service-layer code for the main Electron process. Services implement business logic, orchestrate workflows, and provide reusable operations not tied to the UI or direct database access.

## What Belongs Here
- Business logic modules (e.g., user authentication, payment processing)
- Integrations with external APIs or services
- Application-level utilities that coordinate between flows/controllers and the database
- Reusable service classes or functions used by multiple parts of the app

## What Does NOT Belong Here
- UI components or rendering logic (put those in `renderer/`)
- Direct database models or queries (put those in `db/`)
- One-off scripts or CLI tools
- Low-level helpers or IPC handlers (put those in [`libs/`](../libs/))
- Orchestration logic (put those in [`flows/`](../flows/))

## Best Practices
- Keep services stateless when possible
- Use dependency injection for easier testing
- Centralize shared logic to avoid duplication

---
**Summary:**
This directory is for core business logic and reusable service modules that power the main application flows. For orchestration, use `flows/`. For helpers and IPC, use `libs/`.
