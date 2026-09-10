# Architecture & Product Decision Log

This document records the architectural and product decisions made for the gym workout tracker application.

---

### ADR-001: Technology Stack — React Native + Expo
- **Decision:** Use React Native with Expo (Managed Workflow) for cross-platform mobile development.
- **Reason:** Enables fast cross-platform delivery (iOS & Android) with unified TypeScript code, robust tooling, and rapid development cycles.
- **Status:** Accepted

### ADR-002: Offline-First Architecture
- **Decision:** Build the entire core workout tracking experience to function fully offline.
- **Reason:** Gym environments often have weak or no mobile network connectivity. Immediate local data access ensures zero latency and uninterrupted logging.
- **Status:** Accepted

### ADR-003: Authentication Deferred
- **Decision:** Defer user authentication and login systems during initial foundation and core feature development.
- **Reason:** Reduces early friction and development overhead. Users can log workouts instantly without account creation.
- **Status:** Accepted

### ADR-004: Cloud Backend Deferred
- **Decision:** Postpone cloud backend, server hosting, and remote database implementation.
- **Reason:** Core value is in the local client experience. Cloud infrastructure will be integrated when backup, sync, and multi-device support are required.
- **Status:** Accepted

### ADR-005: Zero Recurring Spending Until Revenue
- **Decision:** Use free and open-source software and tools exclusively; do not introduce paid infrastructure, auth, or APIs until the product generates revenue.
- **Reason:** Minimizes financial risk and overhead for a solo-preneur bootstrap model.
- **Status:** Accepted

### ADR-006: Dark Mode from Day One
- **Decision:** Implement and support dark and light themes simultaneously across all UI components from the start.
- **Reason:** Dark mode is the primary aesthetic preference for gym workout apps (often used in dim gym lighting). Retrofitting dark mode later causes technical debt and styling regressions.
- **Status:** Accepted

### ADR-007: Centralized Design System
- **Decision:** Build and strictly enforce a centralized design token system (colors, typography, spacing, radii, shadows) across all screens.
- **Reason:** Ensures visual consistency, prevents UI fragmentation, and makes theme adjustments straightforward.
- **Status:** Accepted

### ADR-008: Single Consistent Icon System
- **Decision:** Standardize on a single approved icon library and set across the entire app.
- **Reason:** Prevents visual mismatch, avoids bundle bloat from multiple icon dependencies, and maintains unified iconography.
- **Status:** Accepted

### ADR-009: Maintainable & Readable Code Architecture
- **Decision:** Enforce clean architectural layering (UI → Hooks/Logic → Services → Repositories → Local Database) and keep components small and focused.
- **Reason:** Keeps the codebase approachable for a solo developer, minimizes bugs, and simplifies long-term maintenance.
- **Status:** Accepted

### ADR-010: AI Coding Agent Rules & Alignment
- **Decision:** AI coding agents must strictly adhere to established project documentation and guidelines without independently introducing unapproved product or design changes.
- **Reason:** Ensures architectural integrity, prevents scope creep, and keeps development tightly aligned with project vision and constraints.
- **Status:** Accepted

### ADR-011: Icon Family Standardization — Feather via AppIcon
- **Decision:** Use `@expo/vector-icons/Feather` encapsulated within the `<AppIcon />` primitive as the single approved icon system.
- **Reason:** Feather provides a lightweight, minimalist, geometric aesthetic matching the "Quiet Premium — Dark-first Monochrome Athletic" visual identity. Encapsulating behind `AppIcon` prevents mixing icon sets and allows painless central replacement if needed.
- **Status:** Accepted

### ADR-012: Local Database — expo-sqlite with Versioned Migrations
- **Decision:** Use `expo-sqlite` with PRAGMA foreign keys, WAL mode, and a sequential versioned migration runner (`PRAGMA user_version`).
- **Reason:** Provides fast, zero-dependency, local-first structured SQL storage with atomic transactions and clean schema versioning.
- **Status:** Accepted

### ADR-013: Canonical Metric Storage Units
- **Decision:** Store performance weights canonically in kilograms (`REAL`) and durations in seconds (`REAL`).
- **Reason:** Prevents unit conversion drift in persistence records. UI formatting (kg vs lbs) will happen at the presentation layer.
- **Status:** Accepted

### ADR-014: Separation of Routine Templates from Workout Sessions
- **Decision:** Strict architectural separation between `routines` (reusable templates) and `workout_sessions` (historical/active execution records).
- **Reason:** When a user starts a workout, routine exercises are cloned into `workout_exercises`. In-session substitutions, skips, or reordering do not alter the parent routine. Deleting or modifying a routine never mutates or deletes past workout sessions.
- **Status:** Accepted

### ADR-015: Timestamp-Based Rest Timing & Offline Local Notifications
- **Decision:** Drive rest countdown timers strictly through starting and ending timestamps (`restStartedAt + duration = restEndAt`) and schedule offline local notifications via `expo-notifications`.
- **Reason:** React Native timers can be paused or throttled when the app backgrounds or when navigating to other apps (WhatsApp, Spotify, YouTube). Timestamp-based calculation ensures 100% time accuracy upon foregrounding, while local notifications alert the user without requiring backends, internet access, or external push services.
- **Status:** Accepted

