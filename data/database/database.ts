import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import { runMigrations } from './migrations';

export const DATABASE_NAME = 'gym_tracker.db';

let dbInstance: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const db = await openDatabaseAsync(DATABASE_NAME);

    // 1. Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // 2. Enable Write-Ahead Logging for improved concurrent performance
    await db.execAsync('PRAGMA journal_mode = WAL;');

    // 3. Run migrations
    await runMigrations(db);

    dbInstance = db;
    return db;
  })();

  return initPromise;
}

export async function initDatabase(): Promise<SQLiteDatabase> {
  return getDatabase();
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    initPromise = null;
  }
}
