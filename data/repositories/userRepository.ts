import { getDatabase } from '../database/database';
import { User, UserEntity } from '../types/models';
import { generateId } from '../utils/id';
import { nowIso } from '../utils/date';

export class UserRepository {
  async getUser(): Promise<User | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<UserEntity>('SELECT * FROM users LIMIT 1;');
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async ensureUser(): Promise<User> {
    const existing = await this.getUser();
    if (existing) {
      return existing;
    }

    const db = await getDatabase();
    const id = generateId();
    const now = nowIso();

    await db.runAsync(
      'INSERT INTO users (id, created_at, updated_at) VALUES (?, ?, ?);',
      [id, now, now]
    );

    return {
      id,
      createdAt: now,
      updatedAt: now,
    };
  }
}

export const userRepository = new UserRepository();
