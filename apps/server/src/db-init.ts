import { Database } from 'bun:sqlite'

export const initDatabase = (db: Database) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userSessionId TEXT UNIQUE,
        addresses TEXT,
        walking INTEGER,
        biking INTEGER,
        driving INTEGER,
        transit INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `)
}
