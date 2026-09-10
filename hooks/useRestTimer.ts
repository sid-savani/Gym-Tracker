import { useSyncExternalStore, useCallback } from 'react';
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
  remainingSeconds: number;
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

// Module-level single store
let globalState: RestTimerState = {
  status: 'idle',
  totalDurationSeconds: DEFAULT_REST_SECONDS,
  startedAt: null,
  endAt: null,
  remainingWhenPaused: null,
  exerciseName: null,
  workoutId: null,
  remainingSeconds: 0,
};

let moduleTicker: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  // Create new object reference for immutability
  globalState = { ...globalState };
  listeners.forEach((listener) => listener());
}

function calculateCurrentRemaining(state: RestTimerState): number {
  if (state.status === 'idle' || state.status === 'completed') return 0;
  if (state.status === 'paused') {
    return Math.max(0, state.remainingWhenPaused ?? 0);
  }
  if (state.status === 'running' && state.endAt) {
    const remainingMs = state.endAt - Date.now();
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }
  return 0;
}

function stopTicker() {
  if (moduleTicker) {
    clearInterval(moduleTicker);
    moduleTicker = null;
  }
}

function triggerCompletion() {
  stopTicker();
  globalState = {
    ...globalState,
    status: 'completed',
    remainingWhenPaused: null,
    remainingSeconds: 0,
  };
  cancelRestNotification().catch(() => {});
  notifyListeners();

  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  } catch {
    // Haptics fallback
  }
}

function startTicker() {
  stopTicker();

  moduleTicker = setInterval(() => {
    if (globalState.status !== 'running' || !globalState.endAt) {
      stopTicker();
      return;
    }

    const remaining = calculateCurrentRemaining(globalState);
    if (remaining <= 0) {
      triggerCompletion();
    } else {
      globalState = {
        ...globalState,
        remainingSeconds: remaining,
      };
      notifyListeners();
    }
  }, 500);
}

// Module-level AppState listener for background -> foreground transitions
AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
  if (nextAppState === 'active') {
    if (globalState.status === 'running' && globalState.endAt) {
      const now = Date.now();
      if (now >= globalState.endAt) {
        triggerCompletion();
      } else {
        const remaining = Math.max(0, Math.ceil((globalState.endAt - now) / 1000));
        globalState = {
          ...globalState,
          remainingSeconds: remaining,
        };
        startTicker();
        notifyListeners();
      }
    }
  }
});

// Store subscription
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): RestTimerState {
  return globalState;
}

export function formatRestTime(seconds: number): string {
  const safeSecs = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSecs / 60);
  const secs = safeSecs % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(mins)}:${pad(secs)}`;
}

export function useRestTimer(): UseRestTimerReturn {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const startRest = useCallback(
    (
      durationSeconds: number = DEFAULT_REST_SECONDS,
      exerciseName?: string,
      workoutId?: string
    ) => {
      const validDuration = Math.max(1, durationSeconds || DEFAULT_REST_SECONDS);
      const now = Date.now();
      const endAt = now + validDuration * 1000;

      globalState = {
        status: 'running',
        totalDurationSeconds: validDuration,
        startedAt: now,
        endAt,
        remainingWhenPaused: null,
        exerciseName: exerciseName || null,
        workoutId: workoutId || null,
        remainingSeconds: validDuration,
      };

      startTicker();
      scheduleRestCompleteNotification(validDuration, workoutId, exerciseName).catch(() => {});
      notifyListeners();
    },
    []
  );

  const pauseRest = useCallback(() => {
    if (globalState.status !== 'running' || !globalState.endAt) return;

    const remaining = Math.max(1, Math.ceil((globalState.endAt - Date.now()) / 1000));
    stopTicker();

    globalState = {
      ...globalState,
      status: 'paused',
      remainingWhenPaused: remaining,
      remainingSeconds: remaining,
    };

    cancelRestNotification().catch(() => {});
    notifyListeners();
  }, []);

  const resumeRest = useCallback(() => {
    if (
      globalState.status !== 'paused' ||
      globalState.remainingWhenPaused === null ||
      globalState.remainingWhenPaused <= 0
    ) {
      return;
    }

    const remaining = globalState.remainingWhenPaused;
    const now = Date.now();
    const endAt = now + remaining * 1000;

    globalState = {
      ...globalState,
      status: 'running',
      startedAt: now,
      endAt,
      remainingWhenPaused: null,
      remainingSeconds: remaining,
    };

    startTicker();
    scheduleRestCompleteNotification(
      remaining,
      globalState.workoutId || undefined,
      globalState.exerciseName || undefined
    ).catch(() => {});
    notifyListeners();
  }, []);

  const addThirtySeconds = useCallback(() => {
    if (globalState.status === 'running' && globalState.endAt) {
      const newEndAt = globalState.endAt + REST_INCREMENT_SECONDS * 1000;
      const newTotal = globalState.totalDurationSeconds + REST_INCREMENT_SECONDS;
      const newRemaining = Math.max(1, Math.ceil((newEndAt - Date.now()) / 1000));

      globalState = {
        ...globalState,
        endAt: newEndAt,
        totalDurationSeconds: newTotal,
        remainingSeconds: newRemaining,
      };

      scheduleRestCompleteNotification(
        newRemaining,
        globalState.workoutId || undefined,
        globalState.exerciseName || undefined
      ).catch(() => {});
      notifyListeners();
    } else if (
      globalState.status === 'paused' &&
      globalState.remainingWhenPaused !== null
    ) {
      const newRemaining = globalState.remainingWhenPaused + REST_INCREMENT_SECONDS;
      const newTotal = globalState.totalDurationSeconds + REST_INCREMENT_SECONDS;

      globalState = {
        ...globalState,
        remainingWhenPaused: newRemaining,
        totalDurationSeconds: newTotal,
        remainingSeconds: newRemaining,
      };

      notifyListeners();
    } else {
      // If idle or completed, start a 30s rest timer
      startRest(REST_INCREMENT_SECONDS);
    }
  }, [startRest]);

  const skipRest = useCallback(() => {
    stopTicker();
    globalState = {
      status: 'idle',
      totalDurationSeconds: DEFAULT_REST_SECONDS,
      startedAt: null,
      endAt: null,
      remainingWhenPaused: null,
      exerciseName: null,
      workoutId: null,
      remainingSeconds: 0,
    };

    cancelRestNotification().catch(() => {});
    notifyListeners();
  }, []);

  const dismissCompleted = useCallback(() => {
    if (globalState.status === 'completed') {
      stopTicker();
      globalState = {
        status: 'idle',
        totalDurationSeconds: DEFAULT_REST_SECONDS,
        startedAt: null,
        endAt: null,
        remainingWhenPaused: null,
        exerciseName: null,
        workoutId: null,
        remainingSeconds: 0,
      };
      notifyListeners();
    }
  }, []);

  return {
    status: state.status,
    remainingSeconds: state.remainingSeconds,
    remainingDisplay: formatRestTime(state.remainingSeconds),
    totalDurationSeconds: state.totalDurationSeconds,
    exerciseName: state.exerciseName,
    isRunning: state.status === 'running',
    isPaused: state.status === 'paused',
    isCompleted: state.status === 'completed',
    isIdle: state.status === 'idle',
    startRest,
    pauseRest,
    resumeRest,
    addThirtySeconds,
    skipRest,
    dismissCompleted,
  };
}
