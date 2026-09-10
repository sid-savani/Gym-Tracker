import { getDatabase } from '../database/database';
import { WorkoutSet, SetEntity, SetType } from '../types/models';
import { generateId } from '../utils/id';
import { nowIso } from '../utils/date';

export interface CreateSetInput {
  workoutExerciseId: string;
  setNumber?: number;
  setType?: SetType;
  weight?: number | null;
  reps?: number | null;
  duration?: number | null;
  distance?: number | null;
  assistanceWeight?: number | null;
  completedAt?: string | null;
}

export interface UpdateSetInput {
  setNumber?: number;
  setType?: SetType;
  weight?: number | null;
  reps?: number | null;
  duration?: number | null;
  distance?: number | null;
  assistanceWeight?: number | null;
  completedAt?: string | null;
}

export function mapSetEntity(entity: SetEntity): WorkoutSet {
  return {
    id: entity.id,
    workoutExerciseId: entity.workout_exercise_id,
    setNumber: entity.set_number,
    setType: entity.set_type as SetType,
    weight: entity.weight,
    reps: entity.reps,
    duration: entity.duration,
    distance: entity.distance,
    assistanceWeight: entity.assistance_weight,
    completedAt: entity.completed_at,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

export class SetRepository {
  async getSetsForWorkoutExercise(workoutExerciseId: string): Promise<WorkoutSet[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SetEntity>(
      'SELECT * FROM sets WHERE workout_exercise_id = ? ORDER BY set_number ASC, created_at ASC;',
      [workoutExerciseId]
    );
    return rows.map(mapSetEntity);
  }

  async getSetById(id: string): Promise<WorkoutSet | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<SetEntity>(
      'SELECT * FROM sets WHERE id = ?;',
      [id]
    );
    return row ? mapSetEntity(row) : null;
  }

  async addSet(input: CreateSetInput): Promise<WorkoutSet> {
    const db = await getDatabase();
    const id = generateId();
    const now = nowIso();

    // If setNumber is not provided, calculate next set number
    let setNumber = input.setNumber;
    if (setNumber === undefined) {
      const maxSetRow = await db.getFirstAsync<{ max_num: number | null }>(
        'SELECT MAX(set_number) as max_num FROM sets WHERE workout_exercise_id = ?;',
        [input.workoutExerciseId]
      );
      setNumber = (maxSetRow?.max_num ?? 0) + 1;
    }

    const setType = input.setType || 'working';

    await db.runAsync(
      `INSERT INTO sets (
        id, workout_exercise_id, set_number, set_type,
        weight, reps, duration, distance, assistance_weight,
        completed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        input.workoutExerciseId,
        setNumber,
        setType,
        input.weight ?? null,
        input.reps ?? null,
        input.duration ?? null,
        input.distance ?? null,
        input.assistanceWeight ?? null,
        input.completedAt ?? null,
        now,
        now,
      ]
    );

    const created = await this.getSetById(id);
    if (!created) {
      throw new Error(`Failed to create set with ID ${id}`);
    }
    return created;
  }

  async updateSet(id: string, input: UpdateSetInput): Promise<WorkoutSet> {
    const db = await getDatabase();
    const existing = await this.getSetById(id);
    if (!existing) {
      throw new Error(`Set not found: ${id}`);
    }

    const now = nowIso();
    const setNumber = input.setNumber !== undefined ? input.setNumber : existing.setNumber;
    const setType = input.setType !== undefined ? input.setType : existing.setType;
    const weight = input.weight !== undefined ? input.weight : existing.weight;
    const reps = input.reps !== undefined ? input.reps : existing.reps;
    const duration = input.duration !== undefined ? input.duration : existing.duration;
    const distance = input.distance !== undefined ? input.distance : existing.distance;
    const assistanceWeight = input.assistanceWeight !== undefined ? input.assistanceWeight : existing.assistanceWeight;
    const completedAt = input.completedAt !== undefined ? input.completedAt : existing.completedAt;

    await db.runAsync(
      `UPDATE sets SET
        set_number = ?, set_type = ?, weight = ?, reps = ?,
        duration = ?, distance = ?, assistance_weight = ?,
        completed_at = ?, updated_at = ?
      WHERE id = ?;`,
      [
        setNumber,
        setType,
        weight,
        reps,
        duration,
        distance,
        assistanceWeight,
        completedAt,
        now,
        id,
      ]
    );

    const updated = await this.getSetById(id);
    if (!updated) {
      throw new Error(`Failed to retrieve updated set: ${id}`);
    }
    return updated;
  }

  async completeSet(id: string, completedAt?: string): Promise<WorkoutSet> {
    return this.updateSet(id, {
      completedAt: completedAt || nowIso(),
    });
  }

  async uncompleteSet(id: string): Promise<WorkoutSet> {
    return this.updateSet(id, {
      completedAt: null,
    });
  }

  async deleteSet(id: string): Promise<boolean> {
    const db = await getDatabase();
    const existing = await this.getSetById(id);
    if (!existing) {
      return false;
    }

    await db.runAsync('DELETE FROM sets WHERE id = ?;', [id]);

    // Renumber remaining sets for this workout exercise to maintain consecutive numbers
    const remainingSets = await db.getAllAsync<{ id: string }>(
      'SELECT id FROM sets WHERE workout_exercise_id = ? ORDER BY set_number ASC, created_at ASC;',
      [existing.workoutExerciseId]
    );

    for (let i = 0; i < remainingSets.length; i++) {
      await db.runAsync(
        'UPDATE sets SET set_number = ? WHERE id = ?;',
        [i + 1, remainingSets[i].id]
      );
    }

    return true;
  }
}

export const setRepository = new SetRepository();
