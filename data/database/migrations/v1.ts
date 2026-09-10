import { SQLiteDatabase } from 'expo-sqlite';
import { CREATE_TABLES_V1, CREATE_INDEXES_V1 } from '../schema/tables';
import { INITIAL_SEED_EXERCISES } from '../seed/seedExercises';
import { generateId } from '../../utils/id';
import { nowIso } from '../../utils/date';

export async function migrateV1(db: SQLiteDatabase): Promise<void> {
  // 1. Create Tables
  await db.execAsync(CREATE_TABLES_V1);

  // 2. Create Indexes
  await db.execAsync(CREATE_INDEXES_V1);

  // 3. Seed initial built-in exercises if empty
  const exerciseCountRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercises WHERE is_custom = 0;'
  );

  if (!exerciseCountRow || exerciseCountRow.count === 0) {
    for (const ex of INITIAL_SEED_EXERCISES) {
      await db.runAsync(
        `INSERT OR IGNORE INTO exercises (
          id, name, primary_muscle, secondary_muscles, equipment,
          movement_pattern, exercise_type, tracking_metrics, is_custom,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          ex.id,
          ex.name,
          ex.primary_muscle,
          ex.secondary_muscles,
          ex.equipment,
          ex.movement_pattern,
          ex.exercise_type,
          ex.tracking_metrics,
          ex.is_custom,
          ex.created_at,
          ex.updated_at,
        ]
      );
    }
  }

  // 4. Ensure default local user exists
  const userCountRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM users;'
  );

  if (!userCountRow || userCountRow.count === 0) {
    const now = nowIso();
    await db.runAsync(
      'INSERT INTO users (id, created_at, updated_at) VALUES (?, ?, ?);',
      [generateId(), now, now]
    );
  }
}
