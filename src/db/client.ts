import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

// enableChangeListener powers drizzle's useLiveQuery so the tree canvas and
// profile screens re-render automatically after any CRUD operation.
export const expoDb = openDatabaseSync('salasila.db', { enableChangeListener: true });
// SQLite has FK enforcement off by default; needed for media cascade deletes.
expoDb.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(expoDb, { schema });
