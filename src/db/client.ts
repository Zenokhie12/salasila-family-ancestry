import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import migrations from '../../drizzle/migrations';
import * as schema from './schema';

// Opened asynchronously: the sync API is not supported by expo-sqlite's web
// (wasm) backend, and web is a first-class target here. Every consumer runs
// behind the initDb() gate in app/_layout.tsx, so these are always assigned
// by the time they are used.
export let expoDb: SQLiteDatabase;
export let db: ExpoSQLiteDatabase<typeof schema>;

let initPromise: Promise<void> | undefined;

export function initDb(): Promise<void> {
  initPromise ??= (async () => {
    expoDb = await openDatabaseAsync('salasila.db');
    // FK enforcement is off by default; needed for media cascade deletes.
    await expoDb.execAsync('PRAGMA foreign_keys = ON;');
    db = drizzle(expoDb, { schema });
    await migrate(db, migrations);
  })();
  return initPromise;
}
