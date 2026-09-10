import { useState, useEffect, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import {
  workoutRepository,
  setRepository,
  exerciseRepository,
  WorkoutSession,
  WorkoutExercise,
  WorkoutSet,
  SetType,
  UpdateSetInput,
} from '@/data';
import { useRestTimer, UseRestTimerReturn } from './useRestTimer';

export interface UseActiveWorkoutReturn {
  workoutSession: WorkoutSession | null;
  isLoading: boolean;
  error: string | null;
  elapsedSeconds: number;
  elapsedDisplay: string;
  previousPerformance: Record<string, string | null>;
  restTimer: UseRestTimerReturn;
  refresh: () => Promise<void>;
  updateWorkoutName: (name: string) => Promise<void>;
  startManualRest: (durationSeconds?: number) => void;
  // Set operations
  updateSetValues: (
    setId: string,
    workoutExerciseId: string,
    updates: Partial<UpdateSetInput>
  ) => Promise<void>;
  toggleSetCompletion: (setId: string, workoutExerciseId: string) => Promise<void>;
  changeSetType: (
    setId: string,
    workoutExerciseId: string,
    setType: SetType
  ) => Promise<void>;
  addSet: (workoutExerciseId: string) => Promise<void>;
  deleteSet: (setId: string, workoutExerciseId: string) => Promise<void>;
  // Exercise operations
  addExercise: (exerciseId: string) => Promise<void>;
  removeExercise: (workoutExerciseId: string) => Promise<void>;
  replaceExercise: (
    workoutExerciseId: string,
    newExerciseId: string
  ) => Promise<void>;
  moveExercise: (
    workoutExerciseId: string,
    direction: 'up' | 'down'
  ) => Promise<void>;
  // Workout completion/discard operations
  finishWorkout: () => Promise<WorkoutSession>;
  discardWorkout: () => Promise<void>;
}

export function formatElapsedTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function useActiveWorkout(sessionId?: string): UseActiveWorkoutReturn {
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [previousPerformance, setPreviousPerformance] = useState<
    Record<string, string | null>
  >({});

  const restTimer = useRestTimer();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPreviousPerformanceForExercises = useCallback(
    async (exercises: WorkoutExercise[], currentSessionId: string) => {
      const perfMap: Record<string, string | null> = {};
      const uniqueExerciseIds = Array.from(
        new Set(exercises.map((e) => e.exerciseId))
      );

      await Promise.all(
        uniqueExerciseIds.map(async (exId) => {
          try {
            const { summary } = await exerciseRepository.getPreviousPerformance(
              exId,
              currentSessionId
            );
            perfMap[exId] = summary;
          } catch {
            perfMap[exId] = null;
          }
        })
      );

      setPreviousPerformance((prev) => ({ ...prev, ...perfMap }));
    },
    []
  );

  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let session: WorkoutSession | null = null;
      if (sessionId) {
        session = await workoutRepository.getWorkoutSessionById(sessionId);
      }

      if (!session) {
        session = await workoutRepository.getActiveWorkoutSession();
      }

      if (!session) {
        setError('No active workout session found.');
        setWorkoutSession(null);
        return;
      }

      setWorkoutSession(session);

      if (session.exercises && session.exercises.length > 0) {
        await fetchPreviousPerformanceForExercises(session.exercises, session.id);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load workout session.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, fetchPreviousPerformanceForExercises]);

  // Initial load
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Live Timer based on startedAt
  useEffect(() => {
    if (!workoutSession?.startedAt) {
      setElapsedSeconds(0);
      return;
    }

    const calculateElapsed = () => {
      const started = new Date(workoutSession.startedAt).getTime();
      const now = Date.now();
      const seconds = Math.max(0, Math.floor((now - started) / 1000));
      setElapsedSeconds(seconds);
    };

    calculateElapsed();
    timerRef.current = setInterval(calculateElapsed, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [workoutSession?.startedAt]);

  const updateWorkoutName = useCallback(
    async (name: string) => {
      if (!workoutSession) return;
      const trimmed = name.trim();
      if (!trimmed) return;

      try {
        setWorkoutSession((prev) => (prev ? { ...prev, name: trimmed } : null));
        await workoutRepository.updateWorkoutSession(workoutSession.id, {
          name: trimmed,
        });
      } catch (err: any) {
        // Rollback if needed
        loadSession();
        throw new Error(err?.message || 'Failed to update workout name.');
      }
    },
    [workoutSession, loadSession]
  );

  const updateSetValues = useCallback(
    async (
      setId: string,
      workoutExerciseId: string,
      updates: Partial<UpdateSetInput>
    ) => {
      if (!workoutSession) return;

      // Optimistic update in local state
      setWorkoutSession((prev) => {
        if (!prev || !prev.exercises) return prev;
        return {
          ...prev,
          exercises: prev.exercises.map((ex) => {
            if (ex.id !== workoutExerciseId || !ex.sets) return ex;
            return {
              ...ex,
              sets: ex.sets.map((s) => {
                if (s.id !== setId) return s;
                return {
                  ...s,
                  ...updates,
                  weight: updates.weight !== undefined ? updates.weight : s.weight,
                  reps: updates.reps !== undefined ? updates.reps : s.reps,
                  duration: updates.duration !== undefined ? updates.duration : s.duration,
                  distance: updates.distance !== undefined ? updates.distance : s.distance,
                  assistanceWeight:
                    updates.assistanceWeight !== undefined
                      ? updates.assistanceWeight
                      : s.assistanceWeight,
                };
              }),
            };
          }),
        };
      });

      try {
        await setRepository.updateSet(setId, updates);
      } catch (err: any) {
        console.error('Failed to update set:', err);
      }
    },
    [workoutSession]
  );

  const toggleSetCompletion = useCallback(
    async (setId: string, workoutExerciseId: string) => {
      if (!workoutSession) return;

      const exercise = workoutSession.exercises?.find(
        (e) => e.id === workoutExerciseId
      );
      if (!exercise || !exercise.sets) return;

      const targetSetIndex = exercise.sets.findIndex((s) => s.id === setId);
      if (targetSetIndex === -1) return;

      const currentSet = exercise.sets[targetSetIndex];
      const isCurrentlyCompleted = !!currentSet.completedAt;

      if (!isCurrentlyCompleted) {
        // Complete set + trigger haptic
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        } catch {
          // Haptics not available on current platform
        }

        const completed = await setRepository.completeSet(setId);

        // Auto-start Rest Timer with exercise preference or default 90s
        const restDuration = exercise.defaultRestSeconds ?? 90;
        restTimer.startRest(
          restDuration,
          exercise.exercise?.name,
          workoutSession.id
        );

        // Deterministic Prefill Next Set:
        // If next set exists, is incomplete, and has empty values, prefill it with current set's values
        const nextSet = exercise.sets[targetSetIndex + 1];
        let updatedNextSet: WorkoutSet | null = null;

        if (
          nextSet &&
          !nextSet.completedAt &&
          nextSet.weight === null &&
          nextSet.reps === null &&
          (currentSet.weight !== null || currentSet.reps !== null)
        ) {
          const prefillData: Partial<UpdateSetInput> = {
            weight: currentSet.weight,
            reps: currentSet.reps,
            duration: currentSet.duration,
            distance: currentSet.distance,
            assistanceWeight: currentSet.assistanceWeight,
          };
          updatedNextSet = await setRepository.updateSet(nextSet.id, prefillData);
        }

        setWorkoutSession((prev) => {
          if (!prev || !prev.exercises) return prev;
          return {
            ...prev,
            exercises: prev.exercises.map((ex) => {
              if (ex.id !== workoutExerciseId || !ex.sets) return ex;
              return {
                ...ex,
                sets: ex.sets.map((s) => {
                  if (s.id === setId) return completed;
                  if (updatedNextSet && s.id === nextSet.id) return updatedNextSet;
                  return s;
                }),
              };
            }),
          };
        });
      } else {
        // Uncomplete set
        const uncompleted = await setRepository.uncompleteSet(setId);
        setWorkoutSession((prev) => {
          if (!prev || !prev.exercises) return prev;
          return {
            ...prev,
            exercises: prev.exercises.map((ex) => {
              if (ex.id !== workoutExerciseId || !ex.sets) return ex;
              return {
                ...ex,
                sets: ex.sets.map((s) => (s.id === setId ? uncompleted : s)),
              };
            }),
          };
        });
      }
    },
    [workoutSession]
  );

  const changeSetType = useCallback(
    async (setId: string, workoutExerciseId: string, setType: SetType) => {
      if (!workoutSession) return;

      const updated = await setRepository.updateSet(setId, { setType });

      setWorkoutSession((prev) => {
        if (!prev || !prev.exercises) return prev;
        return {
          ...prev,
          exercises: prev.exercises.map((ex) => {
            if (ex.id !== workoutExerciseId || !ex.sets) return ex;
            return {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? updated : s)),
            };
          }),
        };
      });
    },
    [workoutSession]
  );

  const addSet = useCallback(
    async (workoutExerciseId: string) => {
      if (!workoutSession) return;

      const exercise = workoutSession.exercises?.find(
        (e) => e.id === workoutExerciseId
      );
      const lastSet = exercise?.sets && exercise.sets.length > 0
        ? exercise.sets[exercise.sets.length - 1]
        : null;

      const setType: SetType = lastSet
        ? lastSet.setType === 'warmup'
          ? 'working'
          : lastSet.setType
        : 'working';

      const newSet = await setRepository.addSet({
        workoutExerciseId,
        setType,
        weight: lastSet?.weight ?? null,
        reps: lastSet?.reps ?? null,
        duration: lastSet?.duration ?? null,
        distance: lastSet?.distance ?? null,
        assistanceWeight: lastSet?.assistanceWeight ?? null,
      });

      setWorkoutSession((prev) => {
        if (!prev || !prev.exercises) return prev;
        return {
          ...prev,
          exercises: prev.exercises.map((ex) => {
            if (ex.id !== workoutExerciseId) return ex;
            return {
              ...ex,
              sets: [...(ex.sets || []), newSet],
            };
          }),
        };
      });
    },
    [workoutSession]
  );

  const deleteSet = useCallback(
    async (setId: string, workoutExerciseId: string) => {
      if (!workoutSession) return;

      await setRepository.deleteSet(setId);
      const remainingSets = await setRepository.getSetsForWorkoutExercise(
        workoutExerciseId
      );

      setWorkoutSession((prev) => {
        if (!prev || !prev.exercises) return prev;
        return {
          ...prev,
          exercises: prev.exercises.map((ex) => {
            if (ex.id !== workoutExerciseId) return ex;
            return {
              ...ex,
              sets: remainingSets,
            };
          }),
        };
      });
    },
    [workoutSession]
  );

  const addExercise = useCallback(
    async (exerciseId: string) => {
      if (!workoutSession) return;

      const added = await workoutRepository.addExerciseToWorkout(
        workoutSession.id,
        exerciseId
      );

      setWorkoutSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          exercises: [...(prev.exercises || []), added],
        };
      });

      // Fetch previous performance for new exercise
      try {
        const { summary } = await exerciseRepository.getPreviousPerformance(
          exerciseId,
          workoutSession.id
        );
        setPreviousPerformance((prev) => ({ ...prev, [exerciseId]: summary }));
      } catch {
        // Quiet fallback
      }
    },
    [workoutSession]
  );

  const removeExercise = useCallback(
    async (workoutExerciseId: string) => {
      if (!workoutSession) return;

      await workoutRepository.removeExerciseFromWorkout(workoutExerciseId);

      setWorkoutSession((prev) => {
        if (!prev || !prev.exercises) return prev;
        return {
          ...prev,
          exercises: prev.exercises.filter((e) => e.id !== workoutExerciseId),
        };
      });
    },
    [workoutSession]
  );

  const replaceExercise = useCallback(
    async (workoutExerciseId: string, newExerciseId: string) => {
      if (!workoutSession) return;

      const replaced = await workoutRepository.replaceExerciseInWorkout(
        workoutExerciseId,
        newExerciseId
      );

      setWorkoutSession((prev) => {
        if (!prev || !prev.exercises) return prev;
        return {
          ...prev,
          exercises: prev.exercises.map((e) =>
            e.id === workoutExerciseId ? replaced : e
          ),
        };
      });

      // Fetch previous performance for replaced exercise
      try {
        const { summary } = await exerciseRepository.getPreviousPerformance(
          newExerciseId,
          workoutSession.id
        );
        setPreviousPerformance((prev) => ({
          ...prev,
          [newExerciseId]: summary,
        }));
      } catch {
        // Quiet fallback
      }
    },
    [workoutSession]
  );

  const moveExercise = useCallback(
    async (workoutExerciseId: string, direction: 'up' | 'down') => {
      if (!workoutSession || !workoutSession.exercises) return;

      const exercises = [...workoutSession.exercises];
      const index = exercises.findIndex((e) => e.id === workoutExerciseId);
      if (index === -1) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= exercises.length) return;

      // Swap
      const temp = exercises[index];
      exercises[index] = exercises[targetIndex];
      exercises[targetIndex] = temp;

      const orderedIds = exercises.map((e) => e.id);

      // Optimistic update
      setWorkoutSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          exercises,
        };
      });

      await workoutRepository.reorderWorkoutExercises(
        workoutSession.id,
        orderedIds
      );
    },
    [workoutSession]
  );

  const finishWorkout = useCallback(async (): Promise<WorkoutSession> => {
    if (!workoutSession) {
      throw new Error('No active workout session.');
    }
    restTimer.skipRest();
    const completed = await workoutRepository.completeWorkoutSession(
      workoutSession.id
    );
    setWorkoutSession(completed);
    return completed;
  }, [workoutSession, restTimer]);

  const discardWorkout = useCallback(async (): Promise<void> => {
    if (!workoutSession) return;
    restTimer.skipRest();
    await workoutRepository.discardWorkoutSession(workoutSession.id);
  }, [workoutSession, restTimer]);

  const startManualRest = useCallback(
    (durationSeconds?: number) => {
      restTimer.startRest(
        durationSeconds ?? 90,
        undefined,
        workoutSession?.id
      );
    },
    [restTimer, workoutSession?.id]
  );

  return {
    workoutSession,
    isLoading,
    error,
    elapsedSeconds,
    elapsedDisplay: formatElapsedTimer(elapsedSeconds),
    previousPerformance,
    restTimer,
    refresh: loadSession,
    updateWorkoutName,
    updateSetValues,
    toggleSetCompletion,
    changeSetType,
    addSet,
    deleteSet,
    addExercise,
    removeExercise,
    replaceExercise,
    moveExercise,
    finishWorkout,
    discardWorkout,
    startManualRest,
  };
}
