const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'cinema.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create shows table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS shows (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    show_time TEXT NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 20
  )
`);

// Create bookings table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    show_id INTEGER NOT NULL REFERENCES shows(id),
    seat_number INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(show_id, seat_number)
  )
`);

// Seed initial shows if table is empty
const showsCount = db.prepare('SELECT COUNT(*) as count FROM shows').get();
if (showsCount.count === 0) {
  const insertShow = db.prepare(`
    INSERT INTO shows (name, show_time, total_seats)
    VALUES (?, ?, ?)
  `);

  const shows = [
    ['Avengers: Endgame', '2025-06-01 10:00', 20],
    ['Interstellar', '2025-06-01 14:00', 20],
    ['Inception', '2025-06-01 18:00', 20]
  ];

  // Use transaction for bulk insert
  const insertMany = db.transaction((showsData) => {
    for (const show of showsData) {
      insertShow.run(...show);
    }
  });

  insertMany(shows);
  console.log('Database initialized with 3 shows');
}

module.exports = db;
