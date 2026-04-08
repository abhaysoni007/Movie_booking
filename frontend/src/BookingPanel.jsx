import { useState } from 'react';
import { bookTickets, cancelBooking } from './api';

function BookingPanel({ selectedSeats, seatData, showId, onBookingSuccess }) {
  const [userName, setUserName] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const bookedSeats = seatData.seats.filter((s) => s.status === 'booked');
  const totalAvailable = seatData.show.total_seats - bookedSeats.length;

  const handleBook = async () => {
    if (!userName.trim() || selectedSeats.length === 0) {
      setBookingError('Please enter your name and select seats');
      return;
    }

    // Check if trying to book more seats than available
    if (selectedSeats.length > totalAvailable) {
      setBookingError(`Only ${totalAvailable} seats available`);
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(false);

    try {
      const response = await bookTickets(showId, selectedSeats, userName);
      setBookingSuccess(true);
      setUserName('');
      setTimeout(() => setBookingSuccess(false), 3000);
      onBookingSuccess();
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = async (bookingId, seatNumber) => {
    if (!window.confirm(`Cancel booking for seat ${seatNumber}?`)) {
      return;
    }

    setCancelLoading(true);
    setCancelError(null);

    try {
      await cancelBooking(bookingId);
      onBookingSuccess();
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="booking-panel">
      <div className="booking-section-item">
        <h3>Book Tickets</h3>
        
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={bookingLoading}
          className="name-input"
        />

        {selectedSeats.length > 0 && (
          <div className="selected-seats">
            <p>
              <strong>Selected seats:</strong> {selectedSeats.sort((a, b) => a - b).join(', ')}
            </p>
          </div>
        )}

        <button
          className="book-btn"
          onClick={handleBook}
          disabled={
            !userName.trim() ||
            selectedSeats.length === 0 ||
            bookingLoading ||
            selectedSeats.length > totalAvailable
          }
        >
          {bookingLoading ? 'Booking...' : `Book ${selectedSeats.length} Ticket(s)`}
        </button>

        {bookingError && <p className="error-message">{bookingError}</p>}
        {bookingSuccess && (
          <p className="success-message">✓ Booking confirmed!</p>
        )}
      </div>

      {bookedSeats.length > 0 && (
        <div className="booking-section-item">
          <h3>Cancel a Booking</h3>
          
          {cancelError && <p className="error-message">{cancelError}</p>}
          
          <div className="bookings-list">
            {bookedSeats.map((seat) => (
              <div key={seat.booking_id} className="booking-row">
                <div className="booking-info">
                  <span className="seat-label">Seat {seat.seat_number}</span>
                  <span className="user-label">{seat.user_name}</span>
                </div>
                <button
                  className="cancel-btn"
                  onClick={() => handleCancel(seat.booking_id, seat.seat_number)}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? 'Cancelling...' : 'Cancel'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingPanel;
