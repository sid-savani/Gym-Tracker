/**
 * Domain and Database Entity Type Definitions for Gym Tracker Data Layer.
 */

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'lower_back'
  | 'traps'
  | 'neck'
  | 'full_body'
  | 'cardio';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'smith_machine'
  | 'kettlebell'
  | 'band'
  | 'plate'
  | 'other';

export type MovementPattern =
  | 'horizontal_push'
  | 'horizontal_pull'
  | 'vertical_push'
  | 'vertical_pull'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'isolation'
  | 'carry'
  | 'cardio'
  | 'other';

export type ExerciseType =
  | 'weight_reps'
  | 'bodyweight_reps'
  | 'weighted_bodyweight'
  | 'duration'
  | 'distance_duration'
  | 'weight_duration';

export type TrackingMetric = 'weight' | 'reps' | 'duration' | 'distance' | 'assistance_weight';

export type SetType = 'warmup' | 'working' | 'drop' | 'failure';

export type WorkoutSessionStatus = 'active' | 'completed' | 'discarded';

// --- Database Entity Types (Raw SQLite representations) ---

export interface UserEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseEntity {
  id: string;
  name: string;
  primary_muscle: string;
  secondary_muscles: string | null; // JSON string e.g. '["triceps", "shoulders"]'
  equipment: string;
  movement_pattern: string;
  exercise_type: string;
  tracking_metrics: string; // JSON string e.g. '["weight", "reps"]'
  is_custom: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface RoutineEntity {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RoutineExerciseEntity {
  id: string;
  routine_id: string;
  exercise_id: string;
  position: number;
  default_sets: number;
  warmup_enabled: number; // 0 or 1
  default_rest_seconds: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSessionEntity {
  id: string;
  routine_id: string | null;
  name: string;
  status: WorkoutSessionStatus;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExerciseEntity {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  source_routine_exercise_id: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface SetEntity {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  set_type: SetType;
  weight: number | null; // Canonical kilograms
  reps: number | null;
  duration: number | null; // Seconds
  distance: number | null; // Meters
  assistance_weight: number | null; // Kilograms
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// --- Application / Domain Models (Clean, strongly-typed JS objects) ---

export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup | string;
  secondaryMuscles: (MuscleGroup | string)[];
  equipment: Equipment | string;
  movementPattern: MovementPattern | string;
  exerciseType: ExerciseType;
  trackingMetrics: TrackingMetric[];
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  position: number;
  defaultSets: number;
  warmupEnabled: boolean;
  defaultRestSeconds: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  // Optional populated exercise data for convenience
  exercise?: Exercise;
}

export interface Routine {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Optional populated exercises
  exercises?: RoutineExercise[];
}

export interface WorkoutSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  setType: SetType;
  weight: number | null; // Canonical kilograms
  reps: number | null;
  duration: number | null; // Seconds
  distance: number | null; // Meters
  assistanceWeight: number | null; // Kilograms
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutExercise {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  sourceRoutineExerciseId: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  // Populated relationships
  exercise?: Exercise;
  sets?: WorkoutSet[];
  defaultRestSeconds?: number;
}

export interface WorkoutSession {
  id: string;
  routineId: string | null;
  name: string;
  status: WorkoutSessionStatus;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated exercises & sets
  exercises?: WorkoutExercise[];
}
