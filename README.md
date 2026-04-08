# 🎬 CineBook — Real-Time Movie Seat Booking Platform

A full-stack, production-ready web application for browsing movie shows and booking seats in real time.
Built with a modern React frontend and a lightweight Node.js + Express + SQLite backend, designed for performance, simplicity, and reliability.

---

## ✨ Key Features

* 🎭 **Browse Shows** — View available movies with show timings and seat availability
* 💺 **Interactive Seat Selection** — Real-time seat grid with multi-seat selection
* ✅ **Instant Booking Confirmation** — Unique booking IDs generated per seat
* ❌ **Booking Cancellation** — Release seats instantly
* ⚡ **Real-Time Updates** — Seat availability updates after every action
* 🛡️ **Conflict Prevention** — Backend validation to prevent double booking
* 📦 **Lightweight Architecture** — Fast and minimal using SQLite

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | React 19, Vite                      |
| Backend    | Node.js, Express 5                  |
| Database   | SQLite (better-sqlite3)             |
| Utilities  | UUID (unique booking IDs)           |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## 🏗️ Architecture Overview

```bash
Frontend (React - Vercel)
        ↓
API Requests (REST)
        ↓
Backend (Node.js - Render)
        ↓
SQLite Database
```

---

## 📁 Project Structure

```bash
Movie_booking/
├── backend/
│   ├── server.js          # Express server entry point
│   ├── db.js              # SQLite setup & schema initialization
│   └── routes/
│       └── bookings.js    # Booking-related API routes
│
└── frontend/
    ├── src/
    │   ├── App.jsx          # Root layout and show selection
    │   ├── SeatGrid.jsx     # Interactive seat map UI
    │   ├── BookingPanel.jsx # Booking logic & confirmation UI
    │   └── api.js           # API integration layer
    └── index.html
```

---

## 🚀 Getting Started

### 🔹 Prerequisites

* Node.js v18+
* npm

---

### 🔹 1. Clone Repository

```bash
git clone https://github.com/abhaysoni007/Movie_booking.git
cd Movie_booking
```

---

### 🔹 2. Run Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

✔️ Database is auto-created and seeded with sample shows.

---

### 🔹 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

### 🔹 4. Environment Setup

Create `.env` inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

---

## 📡 API Reference

### 🔹 Get All Shows

```
GET /api/shows
```

Returns all shows with seat availability.

---

### 🔹 Get Seat Map

```
GET /api/shows/:showId/seats
```

Returns seat status (20 seats per show).

---

### 🔹 Create Booking

```
POST /api/bookings
```

**Request:**

```json
{
  "show_id": 1,
  "seat_numbers": [3, 7, 12],
  "user_name": "John Doe"
}
```

**Response:**

```json
{
  "message": "Booking confirmed",
  "booking_ids": ["uuid-1", "uuid-2", "uuid-3"],
  "seats_booked": [3, 7, 12]
}
```

---

### 🔹 Cancel Booking

```
DELETE /api/bookings/:bookingId
```

Releases the booked seat.

---

## 🗄️ Database Schema

### 🔹 Shows Table

| Column      | Type    | Description |
| ----------- | ------- | ----------- |
| id          | INTEGER | Primary key |
| name        | TEXT    | Movie title |
| show_time   | TEXT    | Show timing |
| total_seats | INTEGER | Default: 20 |

---

### 🔹 Bookings Table

| Column      | Type | Description         |
| ----------- | ---- | ------------------- |
| id          | TEXT | UUID (Primary key)  |
| show_id     | INT  | Foreign key → shows |
| seat_number | INT  | Seat number (1–20)  |
| user_name   | TEXT | User name           |
| created_at  | TEXT | Timestamp (UTC)     |

---

## 🎟️ Sample Data

| Movie             | Time     | Seats |
| ----------------- | -------- | ----- |
| Avengers: Endgame | 10:00 AM | 20    |
| Interstellar      | 02:00 PM | 20    |
| Inception         | 06:00 PM | 20    |

---

## ⚠️ Notes

* Render free tier may introduce **cold start delays (~30–50s)**
* SQLite is used for simplicity — suitable for demo and lightweight apps

---

## 📌 Future Improvements

* 🔐 JWT Authentication & user sessions
* 💳 Payment integration
* 📊 Admin dashboard for show management
* 📧 Email confirmations
* ⚡ WebSocket-based real-time updates

---

## 📜 License

Licensed under the ISC License.

---

## 👨‍💻 Author

**Abhay Soni**
B.Tech CSE | Full-Stack Developer

---

> Built with a focus on clean architecture, real-time interaction, and production-ready deployment.
