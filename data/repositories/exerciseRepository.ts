import { getDatabase } from '../database/database';
import { Exercise, ExerciseEntity, MuscleGroup, Equipment, MovementPattern, ExerciseType, TrackingMetric, WorkoutSet, SetEntity } from '../types/models';
import { generateId } from '../utils/id';
import { nowIso } from '../utils/date';
import { mapSetEntity } from './setRepository';

export interface CreateExerciseInput {
  name: string;
  primaryMuscle: MuscleGroup | string;
  secondaryMuscles?: (MuscleGroup | string)[];
  equipment: Equipment | string;
  movementPattern: MovementPattern | string;
  exerciseType?: ExerciseType;
  trackingMetrics?: TrackingMetric[];
}

export interface UpdateExerciseInput {
  name?: string;
  primaryMuscle?: MuscleGroup | string;
  secondaryMuscles?: (MuscleGroup | string)[];
  equipment?: Equipment | string;
  movementPattern?: MovementPattern | string;
  exerciseType?: ExerciseType;
  trackingMetrics?: TrackingMetric[];
}

export interface ExerciseFilter {
  muscle?: string;
  equipment?: string;
  isCustom?: boolean;
  search?: string;
}

export function mapExerciseEntity(entity: ExerciseEntity): Exercise {
  let secondaryMuscles: string[] = [];
  try {
    secondaryMuscles = entity.secondary_muscles ? JSON.parse(entity.secondary_muscles) : [];
  } catch {
    secondaryMuscles = [];
  }

  let trackingMetrics: TrackingMetric[] = ['weight', 'reps'];
  try {
    trackingMetrics = entity.tracking_metrics ? JSON.parse(entity.tracking_metrics) : ['weight', 'reps'];
  } catch {
    trackingMetrics = ['weight', 'reps'];
  }

  return {
    id: entity.id,
    name: entity.name,
    primaryMuscle: entity.primary_muscle,
    secondaryMuscles,
    equipment: entity.equipment,
    movementPattern: entity.movement_pattern,
    exerciseType: entity.exercise_type as ExerciseType,
    trackingMetrics,
    isCustom: entity.is_custom === 1,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

export class ExerciseRepository {
  async getExercises(filter?: ExerciseFilter): Promise<Exercise[]> {
    const db = await getDatabase();
    let query = 'SELECT * FROM exercises WHERE 1=1';
    const params: (string | number)[] = [];

    if (filter?.muscle) {
      query += ' AND (primary_muscle = ? OR secondary_muscles LIKE ?)';
      params.push(filter.muscle, `%"${filter.muscle}"%`);
    }

    if (filter?.equipment) {
      query += ' AND equipment = ?';
      params.push(filter.equipment);
    }

    if (filter?.isCustom !== undefined) {
      query += ' AND is_custom = ?';
      params.push(filter.isCustom ? 1 : 0);
    }

    if (filter?.search) {
      query += ' AND name LIKE ?';
      params.push(`%${filter.search}%`);
    }

    query += ' ORDER BY is_custom ASC, name ASC;';

    const rows = await db.getAllAsync<ExerciseEntity>(query, params);
    return rows.map(mapExerciseEntity);
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ExerciseEntity>(
      'SELECT * FROM exercises WHERE id = ?;',
      [id]
    );
    return row ? mapExerciseEntity(row) : null;
  }

  async createCustomExercise(input: CreateExerciseInput): Promise<Exercise> {
    const db = await getDatabase();
    const id = generateId();
    const now = nowIso();
    const secondaryMusclesJson = JSON.stringify(input.secondaryMuscles || []);
    const trackingMetricsJson = JSON.stringify(input.trackingMetrics || ['weight', 'reps']);
    const exerciseType = input.exerciseType || 'weight_reps';

    await db.runAsync(
      `INSERT INTO exercises (
        id, name, primary_muscle, secondary_muscles, equipment,
        movement_pattern, exercise_type, tracking_metrics, is_custom,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?);`,
      [
        id,
        input.name.trim(),
        input.primaryMuscle,
        secondaryMusclesJson,
        input.equipment,
        input.movementPattern,
        exerciseType,
        trackingMetricsJson,
        now,
        now,
      ]
    );

    const created = await this.getExerciseById(id);
    if (!created) {
      throw new Error(`Failed to retrieve newly created exercise with ID ${id}`);
    }
    return created;
  }

  async updateCustomExercise(id: string, input: UpdateExerciseInput): Promise<Exercise> {
    const db = await getDatabase();
    const existing = await this.getExerciseById(id);
    if (!existing) {
      throw new Error(`Exercise not found: ${id}`);
    }
    if (!existing.isCustom) {
      throw new Error('Built-in seed exercises cannot be modified.');
    }

    const now = nowIso();
    const name = input.name !== undefined ? input.name.trim() : existing.name;
    const primaryMuscle = input.primaryMuscle !== undefined ? input.primaryMuscle : existing.primaryMuscle;
    const secondaryMusclesJson = JSON.stringify(
      input.secondaryMuscles !== undefined ? input.secondaryMuscles : existing.secondaryMuscles
    );
    const equipment = input.equipment !== undefined ? input.equipment : existing.equipment;
    const movementPattern = input.movementPattern !== undefined ? input.movementPattern : existing.movementPattern;
    const exerciseType = input.exerciseType !== undefined ? input.exerciseType : existing.exerciseType;
    const trackingMetricsJson = JSON.stringify(
      input.trackingMetrics !== undefined ? input.trackingMetrics : existing.trackingMetrics
    );

    await db.runAsync(
      `UPDATE exercises SET
        name = ?, primary_muscle = ?, secondary_muscles = ?, equipment = ?,
        movement_pattern = ?, exercise_type = ?, tracking_metrics = ?, updated_at = ?
      WHERE id = ? AND is_custom = 1;`,
      [
        name,
        primaryMuscle,
        secondaryMusclesJson,
        equipment,
        movementPattern,
        exerciseType,
        trackingMetricsJson,
        now,
        id,
      ]
    );

    const updated = await this.getExerciseById(id);
    if (!updated) {
      throw new Error(`Failed to retrieve updated exercise: ${id}`);
    }
    return updated;
  }

  async deleteCustomExercise(id: string): Promise<boolean> {
    const db = await getDatabase();
    const existing = await this.getExerciseById(id);
    if (!existing) {
      return false;
    }
    if (!existing.isCustom) {
      throw new Error('Built-in seed exercises cannot be deleted.');
    }

    // Check if exercise is in use by routine_exercises or workout_exercises
    const inUseRoutine = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM routine_exercises WHERE exercise_id = ?;',
      [id]
    );
    if (inUseRoutine && inUseRoutine.count > 0) {
      throw new Error('Cannot delete exercise: It is currently referenced in one or more routines.');
    }

    const inUseWorkout = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM workout_exercises WHERE exercise_id = ?;',
      [id]
    );
    if (inUseWorkout && inUseWorkout.count > 0) {
      throw new Error('Cannot delete exercise: Historical workout records exist for this exercise.');
    }

    await db.runAsync('DELETE FROM exercises WHERE id = ? AND is_custom = 1;', [id]);
    return true;
  }

  /**
   * Retrieves historical performance for an exercise from the most recent completed workout session.
   * Returns empty array and null summary if no completed workout history exists.
   */
  async getPreviousPerformance(
    exerciseId: string,
    excludeWorkoutSessionId?: string
  ): Promise<{ sets: WorkoutSet[]; summary: string | null }> {
    const db = await getDatabase();

    let query = `
      SELECT we.id as workout_exercise_id
      FROM workout_exercises we
      JOIN workout_sessions ws ON we.workout_session_id = ws.id
      WHERE we.exercise_id = ?
        AND ws.status = 'completed'
    `;
    const params: (string | number)[] = [exerciseId];

    if (excludeWorkoutSessionId) {
      query += ' AND ws.id != ?';
      params.push(excludeWorkoutSessionId);
    }

    query += ' ORDER BY ws.started_at DESC, we.created_at DESC LIMIT 1;';

    const latestWorkoutEx = await db.getFirstAsync<{ workout_exercise_id: string }>(query, params);
    if (!latestWorkoutEx) {
      return { sets: [], summary: null };
    }

    const setRows = await db.getAllAsync<SetEntity>(
      'SELECT * FROM sets WHERE workout_exercise_id = ? AND completed_at IS NOT NULL ORDER BY set_number ASC;',
      [latestWorkoutEx.workout_exercise_id]
    );

    if (setRows.length === 0) {
      return { sets: [], summary: null };
    }

    const sets = setRows.map(mapSetEntity);
    const summary = formatPerformanceSummary(sets);

    return { sets, summary };
  }
}

export function formatPerformanceSummary(sets: WorkoutSet[]): string | null {
  if (!sets || sets.length === 0) return null;

  // Prefer working/failure/drop sets over warmup for the summary if available
  const workingSets = sets.filter((s) => s.setType !== 'warmup');
  const targetSets = workingSets.length > 0 ? workingSets : sets;

  // Check if all target sets have weight and reps
  const hasWeightAndReps = targetSets.every((s) => s.weight !== null && s.reps !== null);
  if (hasWeightAndReps) {
    const firstWeight = targetSets[0].weight;
    const firstReps = targetSets[0].reps;
    const allSame = targetSets.every((s) => s.weight === firstWeight && s.reps === firstReps);

    if (allSame) {
      return `${firstWeight} kg × ${firstReps} × ${targetSets.length}`;
    }

    return targetSets.map((s) => `${s.weight} kg × ${s.reps}`).join(', ');
  }

  // Reps only (bodyweight)
  const hasOnlyReps = targetSets.every((s) => s.reps !== null && s.weight === null);
  if (hasOnlyReps) {
    const firstReps = targetSets[0].reps;
    const allSame = targetSets.every((s) => s.reps === firstReps);
    if (allSame) {
      return `${firstReps} reps × ${targetSets.length}`;
    }
    return `${targetSets.map((s) => s.reps).join(', ')} reps`;
  }

  // Duration only
  const hasDuration = targetSets.every((s) => s.duration !== null);
  if (hasDuration) {
    const firstDuration = targetSets[0].duration;
    const allSame = targetSets.every((s) => s.duration === firstDuration);
    if (allSame) {
      return `${firstDuration}s × ${targetSets.length}`;
    }
    return targetSets.map((s) => `${s.duration}s`).join(', ');
  }

  // Fallback: format each set
  return targetSets
    .map((s) => {
      if (s.weight !== null && s.reps !== null) return `${s.weight}kg × ${s.reps}`;
      if (s.reps !== null) return `${s.reps} reps`;
      if (s.duration !== null) return `${s.duration}s`;
      if (s.distance !== null) return `${s.distance}m`;
      return null;
    })
    .filter(Boolean)
    .join(', ') || null;
}

export const exerciseRepository = new ExerciseRepository();

