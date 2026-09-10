import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type Database from 'better-sqlite3';

const sqlite = require('better-sqlite3');

const globalForDb = globalThis as unknown as {
  dbInstance: Database.Database | undefined
};

function initDb(): Database.Database {
  if (globalForDb.dbInstance) {
    return globalForDb.dbInstance;
  }

  const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
  const dataDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'kanban.db');
  const instance: Database.Database = sqlite(dbPath);

  instance.pragma('journal_mode = WAL');
  instance.pragma('foreign_keys = ON');

  // Create tables
  instance.exec(`
    CREATE TABLE IF NOT EXISTS columns (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      position INTEGER NOT NULL,
      wip_limit INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority TEXT DEFAULT 'medium',
      column_id TEXT REFERENCES columns(id),
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      moved_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      card_id TEXT REFERENCES cards(id) ON DELETE CASCADE,
      position INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      action_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      previous_state TEXT NOT NULL,
      new_state TEXT NOT NULL,
      description TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      undone INTEGER DEFAULT 0
    );
  `);

  // Seed default columns if empty
  const columnCount = instance.prepare('SELECT count(*) as count FROM columns').get() as { count: number };
  if (columnCount.count === 0) {
    const insertColumn = instance.prepare('INSERT INTO columns (id, title, position, wip_limit) VALUES (@id, @title, @position, @wipLimit)');
    
    const defaultColumns = [
      { id: uuidv4(), title: 'To Do', position: 0, wipLimit: 0 },
      { id: uuidv4(), title: 'In Progress', position: 1, wipLimit: 3 },
      { id: uuidv4(), title: 'Review', position: 2, wipLimit: 2 },
      { id: uuidv4(), title: 'Done', position: 3, wipLimit: 0 },
    ];

    const seedTx = instance.transaction((columns) => {
      for (const col of columns) {
        insertColumn.run(col);
      }
    });

    seedTx(defaultColumns);
  }

  globalForDb.dbInstance = instance;
  return instance;
}

export const db: Database.Database = new Proxy({} as Database.Database, {
  get(_, prop) {
    const realDb = initDb() as any;
    const value = realDb[prop];
    return typeof value === 'function' ? value.bind(realDb) : value;
  }
});

export default db;
