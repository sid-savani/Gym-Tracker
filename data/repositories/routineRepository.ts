import { getDatabase } from '../database/database';
import {
  Routine,
  RoutineEntity,
  RoutineExercise,
  RoutineExerciseEntity,
  ExerciseEntity,
} from '../types/models';
import { mapExerciseEntity } from './exerciseRepository';
import { generateId } from '../utils/id';
import { nowIso } from '../utils/date';

export interface RoutineExerciseInput {
  exerciseId: string;
  defaultSets?: number;
  warmupEnabled?: boolean;
  defaultRestSeconds?: number;
  notes?: string;
}

export interface CreateRoutineInput {
  name: string;
  exercises?: RoutineExerciseInput[];
}

export interface UpdateRoutineInput {
  name?: string;
}

export interface AddExerciseToRoutineInput {
  exerciseId: string;
  defaultSets?: number;
  warmupEnabled?: boolean;
  defaultRestSeconds?: number;
  notes?: string;
  position?: number;
}

export interface UpdateRoutineExerciseInput {
  defaultSets?: number;
  warmupEnabled?: boolean;
  defaultRestSeconds?: number;
  notes?: string | null;
  position?: number;
}

export class RoutineRepository {
  async getRoutines(): Promise<Routine[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<RoutineEntity>(
      'SELECT * FROM routines ORDER BY name ASC, created_at DESC;'
    );

    const routines: Routine[] = [];
    for (const row of rows) {
      const routine = await this.getRoutineById(row.id);
      if (routine) {
        routines.push(routine);
      }
    }
    return routines;
  }

  async getRoutineById(id: string): Promise<Routine | null> {
    const db = await getDatabase();
    const routineRow = await db.getFirstAsync<RoutineEntity>(
      'SELECT * FROM routines WHERE id = ?;',
      [id]
    );

    if (!routineRow) {
      return null;
    }

    // Fetch joined routine exercises with exercise metadata
    const exerciseRows = await db.getAllAsync<
      RoutineExerciseEntity & {
        ex_name: string;
        ex_primary_muscle: string;
        ex_secondary_muscles: string | null;
        ex_equipment: string;
        ex_movement_pattern: string;
        ex_exercise_type: string;
        ex_tracking_metrics: string;
        ex_is_custom: number;
        ex_created_at: string;
        ex_updated_at: string;
      }
    >(
      `SELECT
        re.*,
        e.name as ex_name,
        e.primary_muscle as ex_primary_muscle,
        e.secondary_muscles as ex_secondary_muscles,
        e.equipment as ex_equipment,
        e.movement_pattern as ex_movement_pattern,
        e.exercise_type as ex_exercise_type,
        e.tracking_metrics as ex_tracking_metrics,
        e.is_custom as ex_is_custom,
        e.created_at as ex_created_at,
        e.updated_at as ex_updated_at
      FROM routine_exercises re
      JOIN exercises e ON re.exercise_id = e.id
      WHERE re.routine_id = ?
      ORDER BY re.position ASC, re.created_at ASC;`,
      [id]
    );

    const exercises: RoutineExercise[] = exerciseRows.map((r) => {
      const exerciseEntity: ExerciseEntity = {
        id: r.exercise_id,
        name: r.ex_name,
        primary_muscle: r.ex_primary_muscle,
        secondary_muscles: r.ex_secondary_muscles,
        equipment: r.ex_equipment,
        movement_pattern: r.ex_movement_pattern,
        exercise_type: r.ex_exercise_type,
        tracking_metrics: r.ex_tracking_metrics,
        is_custom: r.ex_is_custom,
        created_at: r.ex_created_at,
        updated_at: r.ex_updated_at,
      };

      return {
        id: r.id,
        routineId: r.routine_id,
        exerciseId: r.exercise_id,
        position: r.position,
        defaultSets: r.default_sets,
        warmupEnabled: r.warmup_enabled === 1,
        defaultRestSeconds: r.default_rest_seconds,
        notes: r.notes,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        exercise: mapExerciseEntity(exerciseEntity),
      };
    });

    return {
      id: routineRow.id,
      name: routineRow.name,
      createdAt: routineRow.created_at,
      updatedAt: routineRow.updated_at,
      exercises,
    };
  }

  async createRoutine(input: CreateRoutineInput): Promise<Routine> {
    const db = await getDatabase();
    const routineId = generateId();
    const now = nowIso();

    await db.withTransactionAsync(async () => {
      // 1. Insert Routine Header
      await db.runAsync(
        'INSERT INTO routines (id, name, created_at, updated_at) VALUES (?, ?, ?, ?);',
        [routineId, input.name.trim(), now, now]
      );

      // 2. Insert Routine Exercises if provided
      if (input.exercises && input.exercises.length > 0) {
        for (let i = 0; i < input.exercises.length; i++) {
          const exInput = input.exercises[i];
          const reId = generateId();
          await db.runAsync(
            `INSERT INTO routine_exercises (
              id, routine_id, exercise_id, position,
              default_sets, warmup_enabled, default_rest_seconds,
              notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              reId,
              routineId,
              exInput.exerciseId,
              i,
              exInput.defaultSets ?? 3,
              exInput.warmupEnabled ? 1 : 0,
              exInput.defaultRestSeconds ?? 90,
              exInput.notes ?? null,
              now,
              now,
            ]
          );
        }
      }
    });

    const created = await this.getRoutineById(routineId);
    if (!created) {
      throw new Error(`Failed to create routine with ID ${routineId}`);
    }
    return created;
  }

  async updateRoutine(id: string, input: UpdateRoutineInput): Promise<Routine> {
    const db = await getDatabase();
    const existing = await this.getRoutineById(id);
    if (!existing) {
      throw new Error(`Routine not found: ${id}`);
    }

    const now = nowIso();
    const name = input.name !== undefined ? input.name.trim() : existing.name;

    await db.runAsync(
      'UPDATE routines SET name = ?, updated_at = ? WHERE id = ?;',
      [name, now, id]
    );

    const updated = await this.getRoutineById(id);
    if (!updated) {
      throw new Error(`Failed to retrieve updated routine: ${id}`);
    }
    return updated;
  }

  async deleteRoutine(id: string): Promise<boolean> {
    const db = await getDatabase();
    const existing = await this.getRoutineById(id);
    if (!existing) {
      return false;
    }

    // Cascade deletes routine_exercises automatically via foreign key
    // Historical workout_sessions referencing this routine have routine_id set to NULL
    await db.runAsync('DELETE FROM routines WHERE id = ?;', [id]);
    return true;
  }

  async addExerciseToRoutine(
    routineId: string,
    input: AddExerciseToRoutineInput
  ): Promise<RoutineExercise> {
    const db = await getDatabase();
    const routine = await this.getRoutineById(routineId);
    if (!routine) {
      throw new Error(`Routine not found: ${routineId}`);
    }

    const reId = generateId();
    const now = nowIso();

    // Determine position
    let position = input.position;
    if (position === undefined) {
      const maxPosRow = await db.getFirstAsync<{ max_pos: number | null }>(
        'SELECT MAX(position) as max_pos FROM routine_exercises WHERE routine_id = ?;',
        [routineId]
      );
      position = (maxPosRow?.max_pos ?? -1) + 1;
    }

    await db.runAsync(
      `INSERT INTO routine_exercises (
        id, routine_id, exercise_id, position,
        default_sets, warmup_enabled, default_rest_seconds,
        notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        reId,
        routineId,
        input.exerciseId,
        position,
        input.defaultSets ?? 3,
        input.warmupEnabled ? 1 : 0,
        input.defaultRestSeconds ?? 90,
        input.notes ?? null,
        now,
        now,
      ]
    );

    const updatedRoutine = await this.getRoutineById(routineId);
    const added = updatedRoutine?.exercises?.find((e) => e.id === reId);
    if (!added) {
      throw new Error(`Failed to retrieve added routine exercise: ${reId}`);
    }
    return added;
  }

  async removeExerciseFromRoutine(routineExerciseId: string): Promise<boolean> {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<RoutineExerciseEntity>(
      'SELECT * FROM routine_exercises WHERE id = ?;',
      [routineExerciseId]
    );

    if (!existing) {
      return false;
    }

    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM routine_exercises WHERE id = ?;', [routineExerciseId]);

      // Renumber remaining exercises
      const remaining = await db.getAllAsync<{ id: string }>(
        'SELECT id FROM routine_exercises WHERE routine_id = ? ORDER BY position ASC, created_at ASC;',
        [existing.routine_id]
      );

      for (let i = 0; i < remaining.length; i++) {
        await db.runAsync(
          'UPDATE routine_exercises SET position = ? WHERE id = ?;',
          [i, remaining[i].id]
        );
      }
    });

    return true;
  }

  async updateRoutineExercise(
    routineExerciseId: string,
    input: UpdateRoutineExerciseInput
  ): Promise<RoutineExercise> {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<RoutineExerciseEntity>(
      'SELECT * FROM routine_exercises WHERE id = ?;',
      [routineExerciseId]
    );

    if (!existing) {
      throw new Error(`Routine exercise not found: ${routineExerciseId}`);
    }

    const now = nowIso();
    const defaultSets = input.defaultSets !== undefined ? input.defaultSets : existing.default_sets;
    const warmupEnabled = input.warmupEnabled !== undefined ? (input.warmupEnabled ? 1 : 0) : existing.warmup_enabled;
    const defaultRestSeconds = input.defaultRestSeconds !== undefined ? input.defaultRestSeconds : existing.default_rest_seconds;
    const notes = input.notes !== undefined ? input.notes : existing.notes;
    const position = input.position !== undefined ? input.position : existing.position;

    await db.runAsync(
      `UPDATE routine_exercises SET
        default_sets = ?, warmup_enabled = ?, default_rest_seconds = ?,
        notes = ?, position = ?, updated_at = ?
      WHERE id = ?;`,
      [defaultSets, warmupEnabled, defaultRestSeconds, notes, position, now, routineExerciseId]
    );

    const routine = await this.getRoutineById(existing.routine_id);
    const updated = routine?.exercises?.find((e) => e.id === routineExerciseId);
    if (!updated) {
      throw new Error(`Failed to retrieve updated routine exercise: ${routineExerciseId}`);
    }
    return updated;
  }

  async reorderRoutineExercises(
    routineId: string,
    orderedRoutineExerciseIds: string[]
  ): Promise<void> {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      for (let i = 0; i < orderedRoutineExerciseIds.length; i++) {
        await db.runAsync(
          'UPDATE routine_exercises SET position = ? WHERE id = ? AND routine_id = ?;',
          [i, orderedRoutineExerciseIds[i], routineId]
        );
      }
    });
  }
}

export const routineRepository = new RoutineRepository();
