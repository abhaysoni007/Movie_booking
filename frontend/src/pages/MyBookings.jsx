import { useState, useEffect, useContext } from 'react';
import { getUserBookings, cancelBooking } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Trash2, Ticket, Calendar, Clock } from 'lucide-react';
import './MyBookings.css';

export default function MyBookings() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelStatus, setCancelStatus] = useState({ id: null, loading: false, error: null });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchBookings();
  }, [user, navigate, token]);

  const fetchBookings = () => {
    getUserBookings(token)
      .then(data => {
        setBookings(data);
        setLoading(false);
      });
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    setCancelStatus({ id: bookingId, loading: true, error: null });

    try {
      await cancelBooking(bookingId, token);

      // Remove booking from state dynamically
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      setCancelStatus({ id: null, loading: false, error: null });
    } catch (err) {
      setCancelStatus({ id: bookingId, loading: false, error: err.message });
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '70vh' }}>Loading your bookings...</div>;

  return (
    <div className="container bookings-page-container">
      <div className="bookings-header">
        <h2>My Bookings</h2>
        <p>Manage your cinema tickets</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-bookings glass-panel">
          <Ticket size={48} className="empty-icon" />
          <h3>No Bookings Found</h3>
          <p>You haven't booked any movies yet.</p>
          <Link to="/" className="btn btn-primary mt-4">Browse Movies</Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => {
            const bookingDate = new Date(booking.show_time);
            return (
              <div key={booking.id} className="booking-card glass-panel">
                <div className="booking-image" style={{ backgroundImage: `url(${booking.image_url})` }}></div>
                
                <div className="booking-content">
                  <div className="booking-details">
                    <h3>{booking.show_name}</h3>
                    <div className="booking-meta">
                      <span className="meta-item">
                        <Calendar size={14} />
                        {bookingDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="meta-item">
                        <Clock size={14} />
                        {bookingDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="seat-badge-row">
                      <span className="audi-badge">Seat {booking.seat_number}</span>
                      <span className="audi-badge">{booking.type}</span>
                      <span className="price-tag">₹{booking.price}</span>
                    </div>
                  </div>
                  
                  <div className="booking-actions">
                    <Link to={`/ticket/${booking.id}`} className="btn btn-primary view-btn">
                      <Ticket size={16} /> View Ticket
                    </Link>
                    
                    <div className="cancel-wrapper">
                      {cancelStatus.error && cancelStatus.id === booking.id && (
                        <p className="cancel-error">{cancelStatus.error}</p>
                      )}
                      
                      <button 
                        className="btn btn-danger cancel-btn"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancelStatus.loading && cancelStatus.id === booking.id}
                      >
                        <Trash2 size={16} /> 
                        {cancelStatus.loading && cancelStatus.id === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
