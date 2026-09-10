# AI Coding Agent Instructions & Engineering Guidelines

This repository is a premium, extremely fast, clutter-free gym workout tracker mobile app built with React Native and Expo.

All AI coding agents working on this codebase must strictly adhere to the following principles, constraints, and engineering guidelines.

---

## 1. Core Principles & Hard Constraints

1. **Zero Recurring Spending Until Revenue**
   - Use free and open-source solutions exclusively.
   - Do NOT introduce paid authentication, databases, cloud APIs, hosting, or analytics services.
   - Any paid service requires explicit user approval.

2. **Offline-First Architecture**
   - All core workout tracking functionality must function 100% offline.
   - Cloud sync and user accounts are deferred to a later phase.
   - Do NOT implement backend services, APIs, or authentication at this stage.

3. **Dark Mode from Day One**
   - Every UI component and screen must support both light and dark themes simultaneously.
   - Never develop light mode first with the intention of retrofitting dark mode later.
   - Always verify appearance in both color schemes.

4. **Design System Consistency**
   - All visual elements must strictly use values defined in the centralized design system (colors, typography, spacing, border radii, elevation/shadows).
   - Do NOT invent screen-specific or ad-hoc visual styles.
   - Do NOT use arbitrary hex colors or hardcoded spacing values outside design tokens.

5. **Icon Consistency**
   - Use only the single approved icon library for the project (e.g., `@expo/vector-icons` / Lucide / SF Symbols standard).
   - Do NOT introduce arbitrary SVGs, standalone PNG icons, or multiple conflicting icon libraries without explicit approval.

6. **Maintainability & Clean Separation**
   - Write clean, human-readable code.
   - Keep components small, focused, and single-purpose.
   - Maintain clear separation across architectural layers (UI → Hooks/Logic → Services → Repositories → Data Storage).
   - Avoid over-engineering, premature abstractions, and massive multi-thousand-line files.

7. **Move Fast & Avoid Premature Work**
   - Build only what is needed for the current milestone.
   - Do NOT add dependencies unless they solve an immediate, tangible requirement.
   - Do NOT refactor or modify unrelated files while implementing a task.

---

## 2. Engineering Guidelines

### UI & Styling Rules
- Consume theme tokens (colors, spacing, font sizes, radius) via designated theme hooks/providers.
- Ensure high contrast, accessible tap targets (minimum 44x44 pt), and responsive layout behavior across device sizes.
- Favor declarative, readable styles.

### Icons
- Use the project's designated icon component/set consistently.
- Always specify standard size tokens and semantic theme colors when rendering icons.

### Architectural Layering
- **UI (Components / Screens):** Presentational only. Must not execute direct database queries or raw API calls.
- **Hooks / Application Logic:** Coordinate state, interact with services/repositories, and expose clean interfaces to UI.
- **Services:** Pure business logic and domain calculations (e.g., 1RM estimates, volume calculations, plate math).
- **Repositories / Data Access:** Abstract persistence operations (CRUD) from storage engines.
- **Local Storage / Database:** The underlying offline database implementation.

### Dependency Management
- Before adding any npm dependency, verify if the functionality can be accomplished simply with existing Expo / React Native built-ins.
- Prefer lightweight, well-maintained packages with active Expo compatibility.
- Never add packages without a direct, immediate need.

### Testing & Validation
- Ensure code builds cleanly without TypeScript or ESLint errors.
- Test both light and dark theme appearances for every visual change.
- Verify that offline persistence paths handle edge cases gracefully (e.g., null values, empty states, migrations).

### Git & Collaboration Practices
- Write clear, conventional commit messages (e.g., `feat:`, `fix:`, `refactor:`, `docs:`).
- Keep changes atomic and directly relevant to the prompt.
- Never commit secrets, unnecessary generated files, or untracked temporary assets.

### Agent Workflow Discipline
- Follow project instructions and explicit user constraints. Do not make unapproved product, design, or architecture decisions on your own.
- When in doubt, ask for clarification rather than assuming.
