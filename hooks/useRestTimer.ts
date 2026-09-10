import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  scheduleRestCompleteNotification,
  cancelRestNotification,
} from '@/services/notifications';
import { DEFAULT_REST_SECONDS, REST_INCREMENT_SECONDS } from '@/constants/workout';

export type RestTimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface RestTimerState {
  status: RestTimerStatus;
  totalDurationSeconds: number;
  startedAt: number | null; // Timestamp ms
  endAt: number | null; // Timestamp ms
  remainingWhenPaused: number | null; // Seconds remaining when paused
  exerciseName: string | null;
  workoutId: string | null;
}

export interface UseRestTimerReturn {
  status: RestTimerStatus;
  remainingSeconds: number;
  remainingDisplay: string;
  totalDurationSeconds: number;
  exerciseName: string | null;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isIdle: boolean;
  startRest: (durationSeconds?: number, exerciseName?: string, workoutId?: string) => void;
  pauseRest: () => void;
  resumeRest: () => void;
  addThirtySeconds: () => void;
  skipRest: () => void;
  dismissCompleted: () => void;
}

// Module-level state for global persistence across component mounts/screens
let globalTimerState: RestTimerState = {
  status: 'idle',
  totalDurationSeconds: DEFAULT_REST_SECONDS,
  startedAt: null,
  endAt: null,
  remainingWhenPaused: null,
  exerciseName: null,
  workoutId: null,
};

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function formatRestTime(seconds: number): string {
  const safeSecs = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSecs / 60);
  const secs = safeSecs % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(mins)}:${pad(secs)}`;
}

export function useRestTimer(): UseRestTimerReturn {
  const [, setTick] = useState(0);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscribe to module-level timer state updates
  useEffect(() => {
    const handleUpdate = () => {
      setTick((t) => t + 1);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  // Compute remaining seconds from timestamps
  const calculateRemaining = useCallback((): number => {
    if (globalTimerState.status === 'idle') return 0;
    if (globalTimerState.status === 'completed') return 0;
    if (globalTimerState.status === 'paused') {
      return globalTimerState.remainingWhenPaused ?? 0;
    }
    if (globalTimerState.status === 'running' && globalTimerState.endAt) {
      const remainingMs = globalTimerState.endAt - Date.now();
      return Math.max(0, Math.ceil(remainingMs / 1000));
    }
    return 0;
  }, []);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(calculateRemaining);

  // Trigger completion feedback
  const handleRestComplete = useCallback(() => {
    globalTimerState = {
      ...globalTimerState,
      status: 'completed',
      remainingWhenPaused: null,
    };
    setRemainingSeconds(0);
    cancelRestNotification().catch(() => {});
    notifyListeners();

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      // Haptics fallback
    }
  }, []);

  // Sync remaining time with timestamps and manage ticker
  useEffect(() => {
    if (globalTimerState.status !== 'running' || !globalTimerState.endAt) {
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
      setRemainingSeconds(calculateRemaining());
      return;
    }

    const updateTimer = () => {
      if (globalTimerState.status !== 'running' || !globalTimerState.endAt) return;

      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        if (tickerRef.current) {
          clearInterval(tickerRef.current);
          tickerRef.current = null;
        }
        handleRestComplete();
      }
    };

    updateTimer();
    tickerRef.current = setInterval(updateTimer, 500);

    return () => {
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
    };
  }, [calculateRemaining, handleRestComplete]);

  // Handle app background -> foreground transition
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (globalTimerState.status === 'running' && globalTimerState.endAt) {
          const now = Date.now();
          if (now >= globalTimerState.endAt) {
            handleRestComplete();
          } else {
            const remaining = Math.max(0, Math.ceil((globalTimerState.endAt - now) / 1000));
            setRemainingSeconds(remaining);
            notifyListeners();
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [handleRestComplete]);

  // Timer Actions
  const startRest = useCallback(
    (
      durationSeconds: number = DEFAULT_REST_SECONDS,
      exerciseName?: string,
      workoutId?: string
    ) => {
      const validDuration = Math.max(1, durationSeconds || DEFAULT_REST_SECONDS);
      const now = Date.now();
      const endAt = now + validDuration * 1000;

      globalTimerState = {
        status: 'running',
        totalDurationSeconds: validDuration,
        startedAt: now,
        endAt,
        remainingWhenPaused: null,
        exerciseName: exerciseName || null,
        workoutId: workoutId || null,
      };

      setRemainingSeconds(validDuration);
      scheduleRestCompleteNotification(validDuration, workoutId, exerciseName).catch(() => {});
      notifyListeners();
    },
    []
  );

  const pauseRest = useCallback(() => {
    if (globalTimerState.status !== 'running' || !globalTimerState.endAt) return;

    const remaining = Math.max(0, Math.ceil((globalTimerState.endAt - Date.now()) / 1000));
    globalTimerState = {
      ...globalTimerState,
      status: 'paused',
      remainingWhenPaused: remaining,
    };

    setRemainingSeconds(remaining);
    cancelRestNotification().catch(() => {});
    notifyListeners();
  }, []);

  const resumeRest = useCallback(() => {
    if (
      globalTimerState.status !== 'paused' ||
      globalTimerState.remainingWhenPaused === null ||
      globalTimerState.remainingWhenPaused <= 0
    ) {
      return;
    }

    const remaining = globalTimerState.remainingWhenPaused;
    const now = Date.now();
    const endAt = now + remaining * 1000;

    globalTimerState = {
      ...globalTimerState,
      status: 'running',
      startedAt: now,
      endAt,
      remainingWhenPaused: null,
    };

    setRemainingSeconds(remaining);
    scheduleRestCompleteNotification(
      remaining,
      globalTimerState.workoutId || undefined,
      globalTimerState.exerciseName || undefined
    ).catch(() => {});
    notifyListeners();
  }, []);

  const addThirtySeconds = useCallback(() => {
    if (globalTimerState.status === 'running' && globalTimerState.endAt) {
      const newEndAt = globalTimerState.endAt + REST_INCREMENT_SECONDS * 1000;
      const newTotal = globalTimerState.totalDurationSeconds + REST_INCREMENT_SECONDS;
      const newRemaining = Math.max(0, Math.ceil((newEndAt - Date.now()) / 1000));

      globalTimerState = {
        ...globalTimerState,
        endAt: newEndAt,
        totalDurationSeconds: newTotal,
      };

      setRemainingSeconds(newRemaining);
      scheduleRestCompleteNotification(
        newRemaining,
        globalTimerState.workoutId || undefined,
        globalTimerState.exerciseName || undefined
      ).catch(() => {});
      notifyListeners();
    } else if (globalTimerState.status === 'paused' && globalTimerState.remainingWhenPaused !== null) {
      const newRemaining = globalTimerState.remainingWhenPaused + REST_INCREMENT_SECONDS;
      const newTotal = globalTimerState.totalDurationSeconds + REST_INCREMENT_SECONDS;

      globalTimerState = {
        ...globalTimerState,
        remainingWhenPaused: newRemaining,
        totalDurationSeconds: newTotal,
      };

      setRemainingSeconds(newRemaining);
      notifyListeners();
    } else {
      // If idle or completed, start a 30s rest timer
      startRest(REST_INCREMENT_SECONDS);
    }
  }, [startRest]);

  const skipRest = useCallback(() => {
    globalTimerState = {
      status: 'idle',
      totalDurationSeconds: DEFAULT_REST_SECONDS,
      startedAt: null,
      endAt: null,
      remainingWhenPaused: null,
      exerciseName: null,
      workoutId: null,
    };

    setRemainingSeconds(0);
    cancelRestNotification().catch(() => {});
    notifyListeners();
  }, []);

  const dismissCompleted = useCallback(() => {
    if (globalTimerState.status === 'completed') {
      globalTimerState = {
        status: 'idle',
        totalDurationSeconds: DEFAULT_REST_SECONDS,
        startedAt: null,
        endAt: null,
        remainingWhenPaused: null,
        exerciseName: null,
        workoutId: null,
      };
      setRemainingSeconds(0);
      notifyListeners();
    }
  }, []);

  return {
    status: globalTimerState.status,
    remainingSeconds,
    remainingDisplay: formatRestTime(remainingSeconds),
    totalDurationSeconds: globalTimerState.totalDurationSeconds,
    exerciseName: globalTimerState.exerciseName,
    isRunning: globalTimerState.status === 'running',
    isPaused: globalTimerState.status === 'paused',
    isCompleted: globalTimerState.status === 'completed',
    isIdle: globalTimerState.status === 'idle',
    startRest,
    pauseRest,
    resumeRest,
    addThirtySeconds,
    skipRest,
    dismissCompleted,
  };
}
