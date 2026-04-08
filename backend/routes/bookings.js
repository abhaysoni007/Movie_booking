const express = require('express');
const db = require('../db.js');
const { randomUUID: uuidv4 } = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./auth.js');
const { asyncHandler } = require('../utils.js');

const router = express.Router();

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

function getSeatTypeAndPrice(seatNumber, basePrice) {
  if (seatNumber <= 8) return { type: 'Standard', price: basePrice };
  if (seatNumber <= 16) return { type: 'Premium', price: basePrice + 100 };
  return { type: 'VIP', price: basePrice + 250 };
}

// ROUTE 1: GET /api/shows
router.get('/shows', asyncHandler(async (req, res) => {
  const shows = db.prepare('SELECT * FROM shows').all();
  
  if (!shows || shows.length === 0) {
    return res.json([]);
  }

  const result = shows.map(show => {
    const bookingCount = db.prepare(
      'SELECT COUNT(*) as count FROM bookings WHERE show_id = ?'
    ).get(show.id);
    
    return {
      ...show,
      booked_seats: bookingCount ? bookingCount.count : 0,
      available_seats: show.total_seats - (bookingCount ? bookingCount.count : 0)
    };
  });
  
  res.json(result);
}));

// ROUTE 2: GET /api/shows/:showId/seats
router.get('/shows/:showId/seats', asyncHandler(async (req, res) => {
  const showId = parseInt(req.params.showId, 10);
  if (isNaN(showId)) return res.status(400).json({ error: 'Invalid show ID' });

  const show = db.prepare('SELECT * FROM shows WHERE id = ?').get(showId);
  if (!show) return res.status(404).json({ error: 'Show not found' });
  
  const bookings = db.prepare('SELECT seat_number, id, user_id FROM bookings WHERE show_id = ?').all(showId);
  const bookedMap = {};
  bookings.forEach(b => bookedMap[b.seat_number] = b);
  
  const seats = [];
  for (let i = 1; i <= show.total_seats; i++) {
    const { type, price } = getSeatTypeAndPrice(i, show.price_base);
    if (bookedMap[i]) {
      seats.push({ seat_number: i, status: 'booked', type, price, booking_id: bookedMap[i].id, user_id: bookedMap[i].user_id });
    } else {
      seats.push({ seat_number: i, status: 'available', type, price });
    }
  }
  res.json({ show, seats });
}));

// ROUTE 3: POST /api/bookings
router.post('/bookings', authenticateToken, asyncHandler(async (req, res) => {
  const { show_id, seat_numbers } = req.body;
  const userId = req.user.userId;
  
  if (!show_id || !Array.isArray(seat_numbers) || seat_numbers.length === 0) {
    return res.status(400).json({ error: 'Invalid data' });
  }
  
  const show = db.prepare('SELECT * FROM shows WHERE id = ?').get(show_id);
  if (!show) return res.status(400).json({ error: 'Show not found' });
  
  // Check available seats
  const bookedCount = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE show_id = ?').get(show_id);
  if (seat_numbers.length > show.total_seats - (bookedCount ? bookedCount.count : 0)) {
    return res.status(400).json({ error: 'Not enough seats available.' });
  }
  
  const insertBooking = db.prepare(`INSERT INTO bookings (id, show_id, seat_number, user_id) VALUES (?, ?, ?, ?)`);
  const bookingIds = [];
  
  try {
    const insertMany = db.transaction(() => {
      for (const seatNumber of seat_numbers) {
        const bookingId = uuidv4();
        insertBooking.run(bookingId, show_id, seatNumber, userId);
        bookingIds.push(bookingId);
      }
    });
    insertMany();
  } catch (dbError) {
    if (dbError.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'One or more seats were just taken. Refresh and try again.' });
    }
    throw dbError; // Caught by asyncHandler
  }
  
  res.status(201).json({ message: 'Booking confirmed', booking_ids: bookingIds, seats_booked: seat_numbers });
}));

// ROUTE 4: GET /api/bookings/me
router.get('/bookings/me', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const bookings = db.prepare(`
    SELECT b.id, b.seat_number, b.created_at, s.name as show_name, s.show_time, s.image_url, s.price_base
    FROM bookings b
    JOIN shows s ON b.show_id = s.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `).all(userId);
  
  const formatted = bookings.map(b => {
    const { type, price } = getSeatTypeAndPrice(b.seat_number, b.price_base);
    return { ...b, type, price };
  });
  
  res.json(formatted || []);
}));

// ROUTE 5: DELETE /api/bookings/:bookingId
router.delete('/bookings/:bookingId', authenticateToken, asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.userId;
  
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  
  if (booking.user_id !== userId) return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
  
  db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
  res.json({ message: 'Booking cancelled successfully' });
}));

module.exports = router;

