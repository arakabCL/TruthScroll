import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const DB_PATH = process.env.DATABASE_PATH || './data/truthscroll.db'

mkdirSync(dirname(DB_PATH), { recursive: true })

export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS progress (
    user_id          INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_xp         INTEGER NOT NULL DEFAULT 0,
    skill_xp_json    TEXT    NOT NULL DEFAULT '{}',
    grade_history    TEXT    NOT NULL DEFAULT '[]',
    cases_completed  INTEGER NOT NULL DEFAULT 0,
    best_grade       TEXT,
    updated_at       INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_progress_xp ON progress(total_xp DESC);
`)
