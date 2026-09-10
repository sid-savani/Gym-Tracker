import { getDatabase } from '../database/database';
import {
  WorkoutSession,
  WorkoutSessionEntity,
  WorkoutExercise,
  WorkoutExerciseEntity,
  WorkoutSessionStatus,
  ExerciseEntity,
} from '../types/models';
import { mapExerciseEntity } from './exerciseRepository';
import { setRepository } from './setRepository';
import { routineRepository } from './routineRepository';
import { generateId } from '../utils/id';
import { nowIso } from '../utils/date';

export interface CreateWorkoutSessionInput {
  name?: string;
  routineId?: string | null;
  startedAt?: string;
}

export interface UpdateWorkoutSessionInput {
  name?: string;
  status?: WorkoutSessionStatus;
  startedAt?: string;
  completedAt?: string | null;
}

export class WorkoutRepository {
  async getActiveWorkoutSession(): Promise<WorkoutSession | null> {
    const db = await getDatabase();
    const activeRow = await db.getFirstAsync<WorkoutSessionEntity>(
      "SELECT * FROM workout_sessions WHERE status = 'active' ORDER BY started_at DESC LIMIT 1;"
    );

    if (!activeRow) {
      return null;
    }

    return this.getWorkoutSessionById(activeRow.id);
  }

  async getWorkoutSessionById(id: string): Promise<WorkoutSession | null> {
    const db = await getDatabase();
    const sessionRow = await db.getFirstAsync<WorkoutSessionEntity>(
      'SELECT * FROM workout_sessions WHERE id = ?;',
      [id]
    );

    if (!sessionRow) {
      return null;
    }

    // Fetch workout exercises joined with exercise metadata and routine default rest
    const exerciseRows = await db.getAllAsync<
      WorkoutExerciseEntity & {
        routine_default_rest_seconds: number | null;
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
        we.*,
        re.default_rest_seconds as routine_default_rest_seconds,
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
      FROM workout_exercises we
      LEFT JOIN routine_exercises re ON we.source_routine_exercise_id = re.id
      JOIN exercises e ON we.exercise_id = e.id
      WHERE we.workout_session_id = ?
      ORDER BY we.position ASC, we.created_at ASC;`,
      [id]
    );

    const exercises: WorkoutExercise[] = [];
    for (const we of exerciseRows) {
      const exerciseEntity: ExerciseEntity = {
        id: we.exercise_id,
        name: we.ex_name,
        primary_muscle: we.ex_primary_muscle,
        secondary_muscles: we.ex_secondary_muscles,
        equipment: we.ex_equipment,
        movement_pattern: we.ex_movement_pattern,
        exercise_type: we.ex_exercise_type,
        tracking_metrics: we.ex_tracking_metrics,
        is_custom: we.ex_is_custom,
        created_at: we.ex_created_at,
        updated_at: we.ex_updated_at,
      };

      const sets = await setRepository.getSetsForWorkoutExercise(we.id);

      exercises.push({
        id: we.id,
        workoutSessionId: we.workout_session_id,
        exerciseId: we.exercise_id,
        sourceRoutineExerciseId: we.source_routine_exercise_id,
        position: we.position,
        createdAt: we.created_at,
        updatedAt: we.updated_at,
        defaultRestSeconds: we.routine_default_rest_seconds ?? 90,
        exercise: mapExerciseEntity(exerciseEntity),
        sets,
      });
    }

    return {
      id: sessionRow.id,
      routineId: sessionRow.routine_id,
      name: sessionRow.name,
      status: sessionRow.status,
      startedAt: sessionRow.started_at,
      completedAt: sessionRow.completed_at,
      createdAt: sessionRow.created_at,
      updatedAt: sessionRow.updated_at,
      exercises,
    };
  }

  async getWorkoutHistory(limit = 20, offset = 0): Promise<WorkoutSession[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<WorkoutSessionEntity>(
      "SELECT * FROM workout_sessions WHERE status = 'completed' ORDER BY started_at DESC LIMIT ? OFFSET ?;",
      [limit, offset]
    );

    const sessions: WorkoutSession[] = [];
    for (const row of rows) {
      const session = await this.getWorkoutSessionById(row.id);
      if (session) {
        sessions.push(session);
      }
    }
    return sessions;
  }

  async createWorkoutSession(input: CreateWorkoutSessionInput = {}): Promise<WorkoutSession> {
    const db = await getDatabase();
    const id = generateId();
    const now = nowIso();
    const startedAt = input.startedAt || now;
    const name = input.name?.trim() || 'Quick Workout';

    await db.runAsync(
      `INSERT INTO workout_sessions (
        id, routine_id, name, status, started_at, completed_at, created_at, updated_at
      ) VALUES (?, ?, ?, 'active', ?, NULL, ?, ?);`,
      [id, input.routineId || null, name, startedAt, now, now]
    );

    const created = await this.getWorkoutSessionById(id);
    if (!created) {
      throw new Error(`Failed to create workout session: ${id}`);
    }
    return created;
  }

  /**
   * Starts a new workout session from a routine atomically.
   * Clones routine exercises and initializes default set rows.
   */
  async startWorkoutFromRoutine(routineId: string, customName?: string): Promise<WorkoutSession> {
    const db = await getDatabase();
    const routine = await routineRepository.getRoutineById(routineId);
    if (!routine) {
      throw new Error(`Routine not found: ${routineId}`);
    }

    const sessionId = generateId();
    const now = nowIso();
    const workoutName = customName?.trim() || routine.name;

    await db.withTransactionAsync(async () => {
      // 1. Create Workout Session Header
      await db.runAsync(
        `INSERT INTO workout_sessions (
          id, routine_id, name, status, started_at, completed_at, created_at, updated_at
        ) VALUES (?, ?, ?, 'active', ?, NULL, ?, ?);`,
        [sessionId, routineId, workoutName, now, now, now]
      );

      // 2. Clone routine exercises into workout_exercises and create initial set records
      if (routine.exercises && routine.exercises.length > 0) {
        for (let i = 0; i < routine.exercises.length; i++) {
          const re = routine.exercises[i];
          const weId = generateId();

          await db.runAsync(
            `INSERT INTO workout_exercises (
              id, workout_session_id, exercise_id, source_routine_exercise_id,
              position, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [weId, sessionId, re.exerciseId, re.id, i, now, now]
          );

          // Add default sets for each exercise
          const setCount = Math.max(1, re.defaultSets || 3);
          for (let setNum = 1; setNum <= setCount; setNum++) {
            const setId = generateId();
            const setType = re.warmupEnabled && setNum === 1 ? 'warmup' : 'working';

            await db.runAsync(
              `INSERT INTO sets (
                id, workout_exercise_id, set_number, set_type,
                weight, reps, duration, distance, assistance_weight,
                completed_at, created_at, updated_at
              ) VALUES (?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, ?, ?);`,
              [setId, weId, setNum, setType, now, now]
            );
          }
        }
      }
    });

    const created = await this.getWorkoutSessionById(sessionId);
    if (!created) {
      throw new Error(`Failed to initialize workout session from routine ${routineId}`);
    }
    return created;
  }

  async updateWorkoutSession(
    id: string,
    input: UpdateWorkoutSessionInput
  ): Promise<WorkoutSession> {
    const db = await getDatabase();
    const existing = await this.getWorkoutSessionById(id);
    if (!existing) {
      throw new Error(`Workout session not found: ${id}`);
    }

    const now = nowIso();
    const name = input.name !== undefined ? input.name.trim() : existing.name;
    const status = input.status !== undefined ? input.status : existing.status;
    const startedAt = input.startedAt !== undefined ? input.startedAt : existing.startedAt;
    const completedAt = input.completedAt !== undefined ? input.completedAt : existing.completedAt;

    await db.runAsync(
      `UPDATE workout_sessions SET
        name = ?, status = ?, started_at = ?, completed_at = ?, updated_at = ?
      WHERE id = ?;`,
      [name, status, startedAt, completedAt, now, id]
    );

    const updated = await this.getWorkoutSessionById(id);
    if (!updated) {
      throw new Error(`Failed to retrieve updated workout session: ${id}`);
    }
    return updated;
  }

  async completeWorkoutSession(id: string): Promise<WorkoutSession> {
    return this.updateWorkoutSession(id, {
      status: 'completed',
      completedAt: nowIso(),
    });
  }

  async discardWorkoutSession(id: string): Promise<void> {
    const db = await getDatabase();
    const existing = await this.getWorkoutSessionById(id);
    if (!existing) {
      return;
    }
    await db.runAsync(
      "UPDATE workout_sessions SET status = 'discarded', updated_at = ? WHERE id = ?;",
      [nowIso(), id]
    );
  }

  async addExerciseToWorkout(
    workoutSessionId: string,
    exerciseId: string,
    sourceRoutineExerciseId?: string,
    initialSetsCount = 3
  ): Promise<WorkoutExercise> {
    const db = await getDatabase();
    const session = await this.getWorkoutSessionById(workoutSessionId);
    if (!session) {
      throw new Error(`Workout session not found: ${workoutSessionId}`);
    }

    const weId = generateId();
    const now = nowIso();

    const maxPosRow = await db.getFirstAsync<{ max_pos: number | null }>(
      'SELECT MAX(position) as max_pos FROM workout_exercises WHERE workout_session_id = ?;',
      [workoutSessionId]
    );
    const position = (maxPosRow?.max_pos ?? -1) + 1;

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO workout_exercises (
          id, workout_session_id, exercise_id, source_routine_exercise_id,
          position, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [weId, workoutSessionId, exerciseId, sourceRoutineExerciseId || null, position, now, now]
      );

      // Create initial set rows
      const setsCount = Math.max(1, initialSetsCount);
      for (let i = 1; i <= setsCount; i++) {
        const setId = generateId();
        await db.runAsync(
          `INSERT INTO sets (
            id, workout_exercise_id, set_number, set_type,
            weight, reps, duration, distance, assistance_weight,
            completed_at, created_at, updated_at
          ) VALUES (?, ?, ?, 'working', NULL, NULL, NULL, NULL, NULL, NULL, ?, ?);`,
          [setId, weId, i, now, now]
        );
      }
    });

    const updatedSession = await this.getWorkoutSessionById(workoutSessionId);
    const added = updatedSession?.exercises?.find((e) => e.id === weId);
    if (!added) {
      throw new Error(`Failed to retrieve newly added workout exercise: ${weId}`);
    }
    return added;
  }

  async removeExerciseFromWorkout(workoutExerciseId: string): Promise<boolean> {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<WorkoutExerciseEntity>(
      'SELECT * FROM workout_exercises WHERE id = ?;',
      [workoutExerciseId]
    );

    if (!existing) {
      return false;
    }

    await db.withTransactionAsync(async () => {
      // Cascades sets automatically
      await db.runAsync('DELETE FROM workout_exercises WHERE id = ?;', [workoutExerciseId]);

      // Renumber remaining exercises
      const remaining = await db.getAllAsync<{ id: string }>(
        'SELECT id FROM workout_exercises WHERE workout_session_id = ? ORDER BY position ASC, created_at ASC;',
        [existing.workout_session_id]
      );

      for (let i = 0; i < remaining.length; i++) {
        await db.runAsync(
          'UPDATE workout_exercises SET position = ? WHERE id = ?;',
          [i, remaining[i].id]
        );
      }
    });

    return true;
  }

  /**
   * Replaces an exercise in an active workout session while preserving the sets.
   * Does NOT alter the source routine.
   */
  async replaceExerciseInWorkout(
    workoutExerciseId: string,
    newExerciseId: string
  ): Promise<WorkoutExercise> {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<WorkoutExerciseEntity>(
      'SELECT * FROM workout_exercises WHERE id = ?;',
      [workoutExerciseId]
    );

    if (!existing) {
      throw new Error(`Workout exercise not found: ${workoutExerciseId}`);
    }

    const now = nowIso();
    await db.runAsync(
      'UPDATE workout_exercises SET exercise_id = ?, updated_at = ? WHERE id = ?;',
      [newExerciseId, now, workoutExerciseId]
    );

    const session = await this.getWorkoutSessionById(existing.workout_session_id);
    const updated = session?.exercises?.find((e) => e.id === workoutExerciseId);
    if (!updated) {
      throw new Error(`Failed to retrieve updated workout exercise: ${workoutExerciseId}`);
    }
    return updated;
  }

  async reorderWorkoutExercises(
    workoutSessionId: string,
    orderedWorkoutExerciseIds: string[]
  ): Promise<void> {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      for (let i = 0; i < orderedWorkoutExerciseIds.length; i++) {
        await db.runAsync(
          'UPDATE workout_exercises SET position = ? WHERE id = ? AND workout_session_id = ?;',
          [i, orderedWorkoutExerciseIds[i], workoutSessionId]
        );
      }
    });
  }
}

export const workoutRepository = new WorkoutRepository();
