import * as SQLite from 'expo-sqlite';
import { Entry, EntryDraft, HabitTag, MoodScore, EnergyScore } from '@/types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('soft-days.db');
  }
  return db;
}

export async function initDB(): Promise<void> {
  const database = await getDB();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      logged_date TEXT NOT NULL UNIQUE,
      mood_score INTEGER NOT NULL,
      energy_score INTEGER NOT NULL,
      gratitude_text TEXT NOT NULL DEFAULT '',
      free_note TEXT NOT NULL DEFAULT '',
      habits TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

function rowToEntry(row: Record<string, unknown>): Entry {
  return {
    id: row.id as string,
    logged_date: row.logged_date as string,
    mood_score: row.mood_score as MoodScore,
    energy_score: row.energy_score as EnergyScore,
    gratitude_text: row.gratitude_text as string,
    free_note: row.free_note as string,
    habits: JSON.parse(row.habits as string) as HabitTag[],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function upsertEntry(draft: EntryDraft): Promise<Entry> {
  const database = await getDB();
  const now = new Date().toISOString();

  const existing = await database.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM entries WHERE logged_date = ?',
    [draft.logged_date]
  );

  if (existing) {
    await database.runAsync(
      `UPDATE entries SET
        mood_score = ?, energy_score = ?, gratitude_text = ?,
        free_note = ?, habits = ?, updated_at = ?
       WHERE logged_date = ?`,
      [
        draft.mood_score!,
        draft.energy_score!,
        draft.gratitude_text,
        draft.free_note,
        JSON.stringify(draft.habits),
        now,
        draft.logged_date,
      ]
    );
    return rowToEntry({
      ...existing,
      mood_score: draft.mood_score!,
      energy_score: draft.energy_score!,
      gratitude_text: draft.gratitude_text,
      free_note: draft.free_note,
      habits: JSON.stringify(draft.habits),
      updated_at: now,
    });
  } else {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await database.runAsync(
      `INSERT INTO entries
        (id, logged_date, mood_score, energy_score, gratitude_text, free_note, habits, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        draft.logged_date,
        draft.mood_score!,
        draft.energy_score!,
        draft.gratitude_text,
        draft.free_note,
        JSON.stringify(draft.habits),
        now,
        now,
      ]
    );
    return {
      id,
      logged_date: draft.logged_date,
      mood_score: draft.mood_score!,
      energy_score: draft.energy_score!,
      gratitude_text: draft.gratitude_text,
      free_note: draft.free_note,
      habits: draft.habits,
      created_at: now,
      updated_at: now,
    };
  }
}

export async function getEntryByDate(date: string): Promise<Entry | null> {
  const database = await getDB();
  const row = await database.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM entries WHERE logged_date = ?',
    [date]
  );
  return row ? rowToEntry(row) : null;
}

export async function getAllEntries(): Promise<Entry[]> {
  const database = await getDB();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM entries ORDER BY logged_date DESC'
  );
  return rows.map(rowToEntry);
}

export async function deleteEntry(id: string): Promise<void> {
  const database = await getDB();
  await database.runAsync('DELETE FROM entries WHERE id = ?', [id]);
}
