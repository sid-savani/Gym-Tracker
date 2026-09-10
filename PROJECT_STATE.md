# Project State Checkpoint

## Current Phase
Phase 1 — Core Workout Experience

## Current Milestone
Set Interaction + Rest Timer V1 (Completed)

## Completed
* Expo project initialized with Git & GitHub
* Offline-first direction decided (auth/backend deferred, ₹0 spend)
* Dark mode from day one & design-system-first foundation completed
* Local SQLite Data Layer (V1) implemented & locked with `expo-sqlite`
* **Start Workout V1 Experience Implemented (`app/(tabs)/index.tsx`, `hooks/useStartWorkout.ts`)**
* **Active Workout V1 Experience Implemented (`app/workout/[id].tsx`, `hooks/useActiveWorkout.ts`)**
* **Set Interaction + Rest Timer V1 Implemented:**
  - **Auto-Start Rest Timer**: Completing any set persists set completion to SQLite, triggers subtle light haptic feedback, pre-fills the next set deterministically, and automatically starts the rest countdown based on the exercise's routine rest preference (or app default 90s).
  - **Timestamp-Based Accuracy (`hooks/useRestTimer.ts`)**: Countdown calculations are driven by timestamps (`restStartedAt + duration = restEndAt`) rather than simple interval decrements, maintaining 100% accuracy through backgrounding, app pauses, and device multitasking.
  - **Background & Offline Local Notifications (`services/notifications.ts`)**: Uses `expo-notifications` for 100% local, offline push notifications when rest concludes while the app is in the background. Notification tap smoothly returns the user directly to the active workout session without state loss.
  - **App State Synchronization (`AppState`)**: Recomputes remaining seconds or immediately triggers completion state and haptic feedback when returning to foreground.
  - **Quiet Premium Floating Rest Timer UI (`components/workout/RestTimer.tsx`)**: Unobtrusive floating bottom bar with tabular countdown typography (`MM:SS`), Pause/Resume, +30s addition, and Skip controls with accessible touch targets (44x44).
  - **Isolated Performance**: The ticking countdown state is isolated within the timer hook/component to prevent full-screen list re-renders.
  - **Manual Rest Control**: Provides a subtle "Rest" action in the header for manual rest initiation when idle.

## Files & Directories Added / Modified
* `services/notifications.ts` (Offline local notification scheduler and listener)
* `hooks/useRestTimer.ts` (Timestamp-based rest countdown and controls hook)
* `components/workout/RestTimer.tsx` (Floating Quiet Premium rest timer bar)
* `constants/workout.ts` (Default rest timer configuration)
* `hooks/useActiveWorkout.ts` (Integrated auto-start rest timer on set completion)
* `data/types/models.ts` (Added `defaultRestSeconds` to `WorkoutExercise` domain model)
* `data/repositories/workoutRepository.ts` (Joined `routine_exercises.default_rest_seconds` for session exercises)
* `app/workout/[id].tsx` (Active Workout screen layout with floating timer and notification listener)
* `components/workout/index.ts` (Export index for workout components)
* `DECISIONS.md` (Added ADR-015 for timestamp-based rest timing & offline local notifications)

## Repository Operations Used
* `workoutRepository.getWorkoutSessionById(id)` (Active workout recovery with joined rest preferences)
* `workoutRepository.getActiveWorkoutSession()` (Active workout fallback recovery)
* `workoutRepository.updateWorkoutSession(id, updates)` (Renaming workout session)
* `workoutRepository.completeWorkoutSession(id)` (Completing workout session)
* `workoutRepository.discardWorkoutSession(id)` (Discarding workout session)
* `workoutRepository.addExerciseToWorkout(sessionId, exerciseId)` (Adding exercise to workout)
* `workoutRepository.removeExerciseFromWorkout(workoutExerciseId)` (Removing exercise from workout)
* `workoutRepository.replaceExerciseInWorkout(workoutExerciseId, newExerciseId)` (Replacing exercise in workout)
* `workoutRepository.reorderWorkoutExercises(sessionId, orderedIds)` (Persisting exercise reordering)
* `setRepository.addSet(input)` (Adding set with inherited values)
* `setRepository.updateSet(id, updates)` (Updating set values/type)
* `setRepository.completeSet(id)` (Completing set with timestamp)
* `setRepository.uncompleteSet(id)` (Uncompleting set)
* `setRepository.deleteSet(id)` (Deleting and renumbering sets)
* `exerciseRepository.getPreviousPerformance(exerciseId, excludeSessionId)` (Fetching prior performance)
* `exerciseRepository.getExercises(filter)` (Searching and listing exercises)

## Limitations & Next Steps
* **Limitations (Intentional):** Workout summary screen, workout history analytics, PR system, and cloud sync are deferred to dedicated milestones.
* **Next:** Implement Finish Workout Summary / History V1.

---

> [!NOTE]
> This file is a living document and will be updated whenever a meaningful milestone is completed.
