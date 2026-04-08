🎬 CineBook — Movie Seat Booking App
A full-stack web application for browsing movie shows and booking seats in real time. Built with React on the frontend and Node.js + Express + SQLite on the backend.

✨ Features
🎭 Browse available movie shows with timings and seat availability
💺 Interactive seat grid — select one or multiple seats at a glance
✅ Instant booking confirmation with unique booking IDs
❌ Cancel bookings to free up seats
⚡ Real-time seat status updates after every booking or cancellation
🛡️ Input validation and conflict detection (prevents double-booking)
🛠️ Tech Stack
Layer	Technology
Frontend	React 19, Vite
Backend	Node.js, Express 5
Database	SQLite (via better-sqlite3)
UUID	uuid (for unique booking IDs)
📁 Project Structure
Code
Movie_booking/
├── backend/
│   ├── server.js          # Express server entry point
│   ├── db.js              # SQLite setup & schema seeding
│   └── routes/
│       └── bookings.js    # API route handlers
└── frontend/
    ├── src/
    │   ├── App.jsx         # Root component — show selector & layout
    │   ├── SeatGrid.jsx    # Seat map UI
    │   ├── BookingPanel.jsx# Booking form & confirmation
    │   └── api.js          # Frontend API client
    └── index.html
🚀 Getting Started
Prerequisites
Node.js v18+
npm
1. Clone the repository
bash
git clone https://github.com/abhaysoni007/Movie_booking.git
cd Movie_booking
2. Start the Backend
bash
cd backend
npm install
npm run dev
The server starts on http://localhost:5000. The SQLite database is auto-created and seeded with 3 sample shows on first run.

3. Start the Frontend
bash
cd frontend
npm install
npm run dev
The app opens on http://localhost:5173.

4. Configure the API URL
Create a .env file in the frontend/ directory:

env
VITE_API_URL=http://localhost:5000
📡 API Reference
GET /api/shows
Returns all shows with seat availability counts.

GET /api/shows/:showId/seats
Returns the seat map (20 seats) for a specific show, including booking details per seat.

POST /api/bookings
Books one or more seats for a show.

Request body:

JSON
{
  "show_id": 1,
  "seat_numbers": [3, 7, 12],
  "user_name": "John Doe"
}
Response:

JSON
{
  "message": "Booking confirmed",
  "booking_ids": ["uuid-1", "uuid-2", "uuid-3"],
  "seats_booked": [3, 7, 12]
}
DELETE /api/bookings/:bookingId
Cancels a booking and releases the seat.

🗄️ Database Schema
shows

Column	Type	Description
id	INTEGER	Primary key
name	TEXT	Movie title
show_time	TEXT	Date and time of show
total_seats	INTEGER	Seat capacity (default 20)
bookings

Column	Type	Description
id	TEXT	UUID primary key
show_id	INTEGER	Foreign key → shows
seat_number	INTEGER	Seat number (1–20)
user_name	TEXT	Name of the person who booked
created_at	TEXT	Booking timestamp (UTC)
🎟️ Sample Shows (Auto-seeded)
Movie	Date & Time	Seats
Avengers: Endgame	2025-06-01 10:00	20
Interstellar	2025-06-01 14:00	20
Inception	2025-06-01 18:00	20
📜 License
This project is licensed under the ISC License.

Built with ❤️ by Abhay Soni
