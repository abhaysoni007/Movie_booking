const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Initialize database
const dbPath = path.join(__dirname, 'cinema.db');
let db;

try {
  db = new Database(dbPath);
  console.log(`Database connected at: ${dbPath}`);
} catch (error) {
  console.error('CRITICAL: Failed to connect to database:', error.message);
  process.exit(1); // Exit if DB connection fails
}

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// Create shows table
db.exec(`
  CREATE TABLE IF NOT EXISTS shows (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    show_time TEXT NOT NULL,
    audi TEXT NOT NULL DEFAULT 'AUDI 1',
    total_seats INTEGER NOT NULL DEFAULT 20,
    price_base INTEGER NOT NULL DEFAULT 200
  )
`);

// Create bookings table
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    show_id INTEGER NOT NULL REFERENCES shows(id),
    seat_number INTEGER NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(show_id, seat_number)
  )
`);

// Seed initial data if tables are empty
const showsCount = db.prepare('SELECT COUNT(*) as count FROM shows').get();
if (showsCount.count === 0) {
  const insertShow = db.prepare(`
    INSERT INTO shows (name, image_url, show_time, audi, total_seats, price_base)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const shows = [
    // Avengers
    ['Avengers: Endgame', 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop', '2025-06-01 10:00', 'AUDI 1', 20, 250],
    ['Avengers: Endgame', 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop', '2025-06-01 14:00', 'AUDI 1', 20, 250],
    // Interstellar
    ['Interstellar', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop', '2025-06-01 13:00', 'AUDI 2', 20, 300],
    ['Interstellar', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop', '2025-06-01 17:00', 'AUDI 2', 20, 300],
    // Inception
    ['Inception', 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=1935&auto=format&fit=crop', '2025-06-01 18:00', 'AUDI 3', 20, 350],
    ['Inception', 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=1935&auto=format&fit=crop', '2025-06-01 21:30', 'AUDI 3', 20, 350],
    // The Dark Knight
    ['The Dark Knight', 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=2070&auto=format&fit=crop', '2025-06-02 20:00', 'AUDI 1', 20, 300],
    ['The Dark Knight', 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=2070&auto=format&fit=crop', '2025-06-02 23:30', 'AUDI 2', 20, 300]
  ];

  const insertManyShows = db.transaction((showsData) => {
    for (const show of showsData) {
      insertShow.run(...show);
    }
  });
  insertManyShows(shows);
  console.log('Database initialized with 8 shows');

  // Seed demo user
  const demoUserId = uuidv4();
  const demoHash = bcrypt.hashSync('password123', 10);
  db.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)')
    .run(demoUserId, 'Demo User', 'demo@example.com', demoHash);
  console.log('Demo user created: demo@example.com / password123');
}

module.exports = db;
