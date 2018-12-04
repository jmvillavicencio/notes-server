import sqlite3 from 'sqlite3';
import path from 'path';

const sqlite = sqlite3.verbose();

let dbPath = path.resolve(__dirname, '../db/database.db');
if (process.env.NODE_ENV === 'production') {
  dbPath = ':memory:';
}

const db = new sqlite.Database(dbPath);

db.run(`
  CREATE TABLE IF NOT EXISTS Notes (
    id INTEGER UNIQUE,
    title TEXT,
    body TEXT,
    created NUMERIC, PRIMARY KEY(id)
  )
`);

export default db;
