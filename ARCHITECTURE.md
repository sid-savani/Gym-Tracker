# Application Architecture

This document describes the conceptual software architecture and layering strategy for the gym workout tracker application.

---

## 1. Architectural Layers

The application enforces a unidirectional dependency flow. Each layer has strict responsibilities to ensure testability, readability, and long-term maintainability.

```
UI (Screens & Components)
       ↓
Hooks / Application Logic
       ↓
Services (Domain & Business Logic)
       ↓
Repositories (Data Access Layer)
       ↓
Local Database
```

### Layer Breakdown

1. **UI Layer (`components/`, `app/` / screens)**
   - Responsible strictly for rendering views, animations, user interactions, and styling.
   - Consumes data and actions via custom hooks.
   - **Rule:** The UI layer must NEVER directly execute database queries or depend on low-level storage APIs.

2. **Hooks / Application Logic Layer (`hooks/`)**
   - Coordinates component lifecycle, local state, and interacts with domain services and repositories.
   - Provides clean, declarative APIs and reactive state to the UI.

3. **Services Layer (`services/`)**
   - Implements pure business logic, calculations, and domain rules (e.g., progressive overload algorithms, 1RM calculations, plate math, volume statistics).
   - Independent of React rendering and specific UI frameworks.

4. **Repositories / Data Access Layer (`repositories/`)**
   - Provides a clean abstraction boundary over data storage operations (CRUD).
   - Translates domain models to and from database entities.
   - Isolates the rest of the application from changes in underlying database engines.

5. **Local Database Layer (`database/` or `storage/`)**
   - The offline-first local storage implementation (e.g., SQLite / OP-SQLite / local engine).
   - Manages schemas, migrations, and low-level transactions.

---

## 2. Future Synchronization Model

When cloud backup and multi-device accounts are introduced in later phases, the local database remains the single source of truth for the client UI:

```
+-------------------------------------------------------------+
|                      Local Database                         |
+-------------------------------------------------------------+
                              ↕
+-------------------------------------------------------------+
|                         Sync Layer                          |
|             (Change tracking & conflict resolution)         |
+-------------------------------------------------------------+
                              ↕
+-------------------------------------------------------------+
|                       Cloud Backend                         |
+-------------------------------------------------------------+
```

- The UI continues to read and write locally with zero network latency.
- A dedicated background sync layer handles conflict resolution, queued changes, and cloud reconciliation asynchronously.
