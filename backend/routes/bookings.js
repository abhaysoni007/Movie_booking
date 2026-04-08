const express = require('express');
const db = require('../db.js');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ROUTE 1: GET /api/shows
// Fetch all shows with booking counts
router.get('/shows', (req, res) => {
  try {
    const shows = db.prepare('SELECT * FROM shows').all();
    
    const result = shows.map(show => {
      const bookingCount = db.prepare(
        'SELECT COUNT(*) as count FROM bookings WHERE show_id = ?'
      ).get(show.id);
      
      const booked_seats = bookingCount.count;
      const available_seats = show.total_seats - booked_seats;
      
      return {
        id: show.id,
        name: show.name,
        show_time: show.show_time,
        total_seats: show.total_seats,
        booked_seats,
        available_seats
      };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
});

// ROUTE 2: GET /api/shows/:showId/seats
// Get seat availability for a specific show
router.get('/shows/:showId/seats', (req, res) => {
  try {
    const showId = parseInt(req.params.showId, 10);
    
    // Check if show exists
    const show = db.prepare('SELECT * FROM shows WHERE id = ?').get(showId);
    if (!show) {
      return res.status(404).json({ error: 'Show not found' });
    }
    
    // Fetch all bookings for this show
    const bookings = db.prepare(
      'SELECT seat_number, id, user_name FROM bookings WHERE show_id = ?'
    ).all(showId);
    
    // Create a map of booked seats for quick lookup
    const bookedMap = {};
    bookings.forEach(booking => {
      bookedMap[booking.seat_number] = {
        booking_id: booking.id,
        user_name: booking.user_name
      };
    });
    
    // Create array of 20 seat objects
    const seats = [];
    for (let i = 1; i <= 20; i++) {
      if (bookedMap[i]) {
        seats.push({
          seat_number: i,
          status: 'booked',
          booking_id: bookedMap[i].booking_id,
          user_name: bookedMap[i].user_name
        });
      } else {
        seats.push({
          seat_number: i,
          status: 'available',
          booking_id: null,
          user_name: null
        });
      }
    }
    
    res.json({
      show: {
        id: show.id,
        name: show.name,
        show_time: show.show_time,
        total_seats: show.total_seats
      },
      seats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

// ROUTE 3: POST /api/bookings
// Create bookings with comprehensive validations
router.post('/bookings', (req, res) => {
  try {
    const { show_id, seat_numbers, user_name } = req.body;
    
    // Validation a: show_id must be present and valid
    if (!show_id) {
      return res.status(400).json({ error: 'show_id is required' });
    }
    const show = db.prepare('SELECT * FROM shows WHERE id = ?').get(show_id);
    if (!show) {
      return res.status(400).json({ error: 'Show does not exist' });
    }
    
    // Validation b: seat_numbers must be a non-empty array
    if (!Array.isArray(seat_numbers) || seat_numbers.length === 0) {
      return res.status(400).json({ error: 'seat_numbers must be a non-empty array' });
    }
    
    // Validation c: all seat_numbers must be integers between 1 and 20
    for (const seat of seat_numbers) {
      if (!Number.isInteger(seat) || seat < 1 || seat > 20) {
        return res.status(400).json({ error: 'All seat numbers must be integers between 1 and 20' });
      }
    }
    
    // Validation d: no duplicates in seat_numbers
    const uniqueSeats = new Set(seat_numbers);
    if (uniqueSeats.size !== seat_numbers.length) {
      return res.status(400).json({ error: 'seat_numbers must not contain duplicates' });
    }
    
    // Validation e: user_name must be a non-empty string
    if (!user_name || typeof user_name !== 'string' || user_name.trim() === '') {
      return res.status(400).json({ error: 'user_name must be a non-empty string' });
    }
    
    // Check available seats
    const bookedCount = db.prepare(
      'SELECT COUNT(*) as count FROM bookings WHERE show_id = ?'
    ).get(show_id);
    
    const remainingSeats = show.total_seats - bookedCount.count;
    if (seat_numbers.length > remainingSeats) {
      return res.status(400).json({
        error: `Not enough seats available. ${remainingSeats} seats remaining.`
      });
    }
    
    // Check for already booked seats
    const placeholders = seat_numbers.map(() => '?').join(',');
    const bookedSeats = db.prepare(
      `SELECT seat_number FROM bookings WHERE show_id = ? AND seat_number IN (${placeholders})`
    ).all(show_id, ...seat_numbers);
    
    if (bookedSeats.length > 0) {
      const conflictingSeats = bookedSeats.map(b => b.seat_number).sort((a, b) => a - b);
      return res.status(409).json({
        error: `Seats already booked: ${conflictingSeats.join(', ')}`
      });
    }
    
    // Use transaction to insert all bookings atomically
    const insertBooking = db.prepare(`
      INSERT INTO bookings (id, show_id, seat_number, user_name)
      VALUES (?, ?, ?, ?)
    `);
    
    const bookingIds = [];
    try {
      const insertMany = db.transaction(() => {
        for (const seatNumber of seat_numbers) {
          const bookingId = uuidv4();
          insertBooking.run(bookingId, show_id, seatNumber, user_name.trim());
          bookingIds.push(bookingId);
        }
      });
      
      insertMany();
    } catch (dbError) {
      // Catch UNIQUE constraint violation
      if (dbError.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          error: 'One or more seats were just taken. Please refresh and try again.'
        });
      }
      throw dbError;
    }
    
    res.status(201).json({
      message: 'Booking confirmed',
      booking_ids: bookingIds,
      seats_booked: seat_numbers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// ROUTE 4: DELETE /api/bookings/:bookingId
// Cancel a booking
router.delete('/bookings/:bookingId', (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Find the booking
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Delete the booking
    db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
    
    res.json({
      message: 'Booking cancelled successfully',
      seat_number: booking.seat_number,
      show_id: booking.show_id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;
