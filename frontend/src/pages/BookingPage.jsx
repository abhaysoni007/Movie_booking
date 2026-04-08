import { useState, useEffect, useContext } from 'react';
import { getSeats } from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, Info } from 'lucide-react';
import './Booking.css';

export default function BookingPage() {
  const { showId } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    getSeats(showId)
      .then(data => {
        setShow(data.show);
        setSeats(data.seats);
        setLoading(false);
      });
  }, [showId, user, navigate]);

  const toggleSeat = (seat) => {
    if (seat.status === 'booked') return;
    
    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.seat_number === seat.seat_number);
      if (isSelected) return prev.filter(s => s.seat_number !== seat.seat_number);
      return [...prev, seat];
    });
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleCheckout = () => {
    navigate('/payment', { 
      state: { 
        show, 
        selectedSeats, 
        total: calculateTotal() 
      } 
    });
  };

  if (loading) return <div className="flex-center" style={{ height: '70vh' }}>Loading seating chart...</div>;

  return (
    <div className="container booking-container">
      <div className="seating-section glass-panel">
        <h2 className="section-title">Select Seats</h2>
        <div className="screen-indicator">
          <div className="screen-curve"></div>
          <span>SCREEN</span>
        </div>
        
        <div className="seat-grid">
          {seats.map(seat => (
            <div 
              key={seat.seat_number}
              className={`seat ${seat.status} ${seat.type.toLowerCase()} ${selectedSeats.find(s => s.seat_number === seat.seat_number) ? 'selected' : ''}`}
              onClick={() => toggleSeat(seat)}
              title={`${seat.type} - ₹${seat.price}`}
            >
              {seat.seat_number}
            </div>
          ))}
        </div>

        <div className="legend">
          <div className="legend-item"><div className="seat legend-seat standard"></div> Standard (₹{show.price_base})</div>
          <div className="legend-item"><div className="seat legend-seat premium"></div> Premium (₹{show.price_base + 100})</div>
          <div className="legend-item"><div className="seat legend-seat vip"></div> VIP (₹{show.price_base + 250})</div>
          <div className="legend-item"><div className="seat legend-seat booked"></div> Booked</div>
          <div className="legend-item"><div className="seat legend-seat selected"></div> Selected</div>
        </div>
      </div>

      <div className="checkout-sidebar glass-panel">
        <div className="checkout-movie-info" style={{ backgroundImage: `url(${show.image_url})` }}>
          <div className="checkout-movie-overlay">
            <h3>{show.name}</h3>
            <p>{new Date(show.show_time).toLocaleString()} • {show.audi}</p>
          </div>
        </div>

        <div className="checkout-details">
          <h4>Booking Summary</h4>
          {selectedSeats.length === 0 ? (
            <div className="empty-selection">
              <Info size={24} />
              <p>Please select your seats to continue</p>
            </div>
          ) : (
            <>
              <ul className="selected-list">
                {selectedSeats.map(seat => (
                  <li key={seat.seat_number} className="selected-item">
                    <span>Seat {seat.seat_number} ({seat.type})</span>
                    <span>₹{seat.price}</span>
                  </li>
                ))}
              </ul>
              
              <div className="checkout-total">
                <span>Total Amount</span>
                <span>₹{calculateTotal()}</span>
              </div>

              <button 
                className="btn btn-primary checkout-btn" 
                onClick={handleCheckout}
              >
                <CreditCard size={18} />
                Proceed to Pay ₹{calculateTotal()}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
