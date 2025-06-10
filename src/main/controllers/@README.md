# `flows` Directory

This directory contains business logic flows, orchestrations, and process pipelines for the main Electron process.

## What Belongs Here
- **Flow definitions:** Coordinate multiple services, DB calls, or business logic steps
- **Orchestration logic:** Manage multi-step processes, state machines, or workflow engines
- **Process pipelines:** Chain together multiple operations or tasks
- **Integration flows:** Sequence external/internal APIs, services, or modules

## What Does NOT Belong Here
- Low-level utility functions (put those in [`libs/`](../libs/))
- Direct database models or queries (put those in `db/`)
- UI components (put those in `renderer/`)
- Business logic specific to a single service (put those in [`services/`](../services/))

## File Naming
- Use descriptive names for each flow (e.g., `userOnboardingFlow.ts`, `paymentProcessingFlow.ts`).

---
**Summary:**
Flows are for orchestrating and sequencing business logic. If your code is a reusable helper, put it in `libs/`. If it's core business logic or a reusable service, use `services/`.

Add new flows as separate files. Keep each flow focused and reusable.
