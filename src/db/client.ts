import { drizzle, type SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { openDatabaseAsync, type SQLiteBindParams, type SQLiteDatabase } from 'expo-sqlite';

import migrationBundle from '../../drizzle/migrations';
import { ensureCrossOriginIsolated } from '../lib/crossOriginIsolation';
import * as schema from './schema';

// Drizzle talks to expo-sqlite exclusively through the ASYNC API below.
// Drizzle's own expo-sqlite driver is sync-only, and expo-sqlite's web
// backend (SDK 54) has a length-encoding bug in its sync SharedArrayBuffer
// channel that truncates any result JSON over 255 bytes — every read of real
// data dies with "Unterminated string in JSON". The async path uses plain
// postMessage and is unaffected; on native both paths work, so async
// everywhere keeps one code path.
//
// Every consumer runs behind the initDb() gate in app/_layout.tsx, so these
// are always assigned by the time they are used.
export let expoDb: SQLiteDatabase;
export let db: SqliteRemoteDatabase<typeof schema>;

let initPromise: Promise<void> | undefined;

export function initDb(): Promise<void> {
  initPromise ??= (async () => {
    await ensureCrossOriginIsolated();
    expoDb = await openDatabaseAsync('salasila.db');
    // FK enforcement is off by default; needed for media cascade deletes.
    await expoDb.execAsync('PRAGMA foreign_keys = ON;');
    await runMigrations(expoDb);
    db = drizzle(runQuery, { schema });
  })();
  return initPromise;
}

async function runQuery(
  sqlText: string,
  params: unknown[],
  method: 'run' | 'all' | 'values' | 'get',
): Promise<{ rows: unknown[] }> {
  const statement = await expoDb.prepareAsync(sqlText);
  try {
    const result = await statement.executeForRawResultAsync(params as SQLiteBindParams);
    if (method === 'run') return { rows: [] };
    if (method === 'get') {
      const row = await result.getFirstAsync();
      return { rows: row ?? [] };
    }
    return { rows: await result.getAllAsync() };
  } finally {
    await statement.finalizeAsync();
  }
}

/**
 * Applies drizzle-kit's generated .sql migrations in journal order, tracking
 * progress in PRAGMA user_version (= number of applied migrations). Replaces
 * drizzle's own migrate(), which runs through the broken sync channel on web.
 */
async function runMigrations(database: SQLiteDatabase): Promise<void> {
  const { journal, migrations } = migrationBundle as {
    journal: { entries: { idx: number; tag: string }[] };
    migrations: Record<string, string>;
  };

  const versionRow = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let applied = versionRow?.user_version ?? 0;

  // Adopt databases created by drizzle's migrator before this runner existed
  // (they have the schema but user_version 0).
  if (applied === 0) {
    const existing = await database.getFirstAsync(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'people'",
    );
    if (existing) {
      applied = 1;
      await database.execAsync('PRAGMA user_version = 1');
    }
  }

  for (const entry of journal.entries) {
    if (entry.idx < applied) continue;
    const migrationSql = migrations[`m${String(entry.idx).padStart(4, '0')}`];
    if (!migrationSql) throw new Error(`Missing migration file for ${entry.tag}`);
    for (const statement of migrationSql.split('--> statement-breakpoint')) {
      await database.execAsync(statement);
    }
    await database.execAsync(`PRAGMA user_version = ${entry.idx + 1}`);
  }
}
