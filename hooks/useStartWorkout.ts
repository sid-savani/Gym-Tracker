import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  routineRepository,
  workoutRepository,
  Routine,
  WorkoutSession,
} from '@/data';

export interface UseStartWorkoutReturn {
  routines: Routine[];
  activeWorkout: WorkoutSession | null;
  isLoading: boolean;
  isCreatingRoutine: boolean;
  error: string | null;
  isRecoveryDismissed: boolean;
  dismissRecovery: () => void;
  refresh: () => Promise<void>;
  createRoutine: (name: string) => Promise<Routine>;
  startRoutineWorkout: (routineId: string) => Promise<WorkoutSession>;
  startEmptyWorkout: () => Promise<WorkoutSession>;
  formatElapsedTime: (startedAt: string) => string;
}

export function formatWorkoutElapsedTime(startedAt: string): string {
  const started = new Date(startedAt).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(0, Math.floor((now - started) / (1000 * 60)));

  if (diffMinutes < 1) {
    return 'Just started';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min in progress`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr in progress`;
  }
  return `${hours} hr ${remainingMinutes} min in progress`;
}

export function useStartWorkout(): UseStartWorkoutReturn {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecoveryDismissed, setIsRecoveryDismissed] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [loadedRoutines, activeSession] = await Promise.all([
        routineRepository.getRoutines(),
        workoutRepository.getActiveWorkoutSession(),
      ]);

      setRoutines(loadedRoutines);
      setActiveWorkout(activeSession);
    } catch (err: any) {
      setError(err?.message || 'Failed to load workout data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const dismissRecovery = useCallback(() => {
    setIsRecoveryDismissed(true);
  }, []);

  const createRoutine = useCallback(
    async (name: string): Promise<Routine> => {
      try {
        setIsCreatingRoutine(true);
        const newRoutine = await routineRepository.createRoutine({ name });
        await loadData();
        return newRoutine;
      } catch (err: any) {
        throw new Error(err?.message || 'Failed to create routine.');
      } finally {
        setIsCreatingRoutine(false);
      }
    },
    [loadData]
  );

  const startRoutineWorkout = useCallback(
    async (routineId: string): Promise<WorkoutSession> => {
      try {
        const session = await workoutRepository.startWorkoutFromRoutine(routineId);
        setActiveWorkout(session);
        return session;
      } catch (err: any) {
        throw new Error(err?.message || 'Failed to start workout from routine.');
      }
    },
    []
  );

  const startEmptyWorkout = useCallback(async (): Promise<WorkoutSession> => {
    try {
      const session = await workoutRepository.createWorkoutSession({
        name: 'Quick Workout',
      });
      setActiveWorkout(session);
      return session;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to start empty workout.');
    }
  }, []);

  return {
    routines,
    activeWorkout,
    isLoading,
    isCreatingRoutine,
    error,
    isRecoveryDismissed,
    dismissRecovery,
    refresh: loadData,
    createRoutine,
    startRoutineWorkout,
    startEmptyWorkout,
    formatElapsedTime: formatWorkoutElapsedTime,
  };
}
