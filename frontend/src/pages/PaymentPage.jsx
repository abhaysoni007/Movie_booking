import { useState, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, Lock, ChevronLeft } from 'lucide-react';
import './Payment.css';

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Basic form states for UI feel
  const [cardNo, setCardNo] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  if (!state || !state.show || !state.selectedSeats) {
    return (
      <div className="flex-center" style={{ height: '70vh', flexDirection: 'column', gap: '1rem' }}>
        <h2>Invalid Payment Session</h2>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  const { show, selectedSeats, total } = state;

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!cardNo || !expiry || !cvv) {
      setError('Please fill in all card details');
      return;
    }
    
    setError('');
    setIsProcessing(true);

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          show_id: parseInt(show.id),
          seat_numbers: selectedSeats.map(s => s.seat_number)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Success! Navigate to the first ticket
      navigate(`/ticket/${data.booking_ids[0]}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="container payment-container">
      <div className="payment-content">
        <Link to={`/book/${show.id}`} className="btn btn-secondary back-btn" style={{ marginBottom: '2rem' }}>
          <ChevronLeft size={20} /> Back to Seats
        </Link>
        
        <div className="payment-grid">
          {/* Order Summary */}
          <div className="order-summary glass-panel">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-movie">
              <img src={show.image_url} alt={show.name} className="summary-poster" />
              <div className="summary-movie-info">
                <h4>{show.name}</h4>
                <p className="summary-time">
                  {new Date(show.show_time).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                <span className="summary-audi">{show.audi}</span>
              </div>
            </div>
            
            <div className="summary-seats">
              <h5>{selectedSeats.length} Tickets</h5>
              <ul>
                {selectedSeats.map(seat => (
                  <li key={seat.seat_number}>
                     <span>Seat {seat.seat_number} ({seat.type})</span>
                     <span>₹{seat.price}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-total">
              <span>Total Payable</span>
              <span className="total-amount">₹{total}</span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form-section glass-panel">
            <div className="payment-header">
              <h3>Payment Details</h3>
              <div className="secure-badge">
                <Lock size={14} /> Secure Payment
              </div>
            </div>
            
            {error && <div className="payment-error">{error}</div>}
            
            <form onSubmit={handlePayment} className="payment-form">
              <div className="input-group">
                <label className="input-label">Card Number</label>
                <div className="card-input-wrapper">
                  <CreditCard size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className="input-field with-icon" 
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={cardNo}
                    onChange={e => setCardNo(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Expiry Date</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="MM/YY" 
                    maxLength={5}
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">CVV</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="123" 
                    maxLength={4}
                    value={cvv}
                    onChange={e => setCvv(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label className="input-label">Name on Card</label>
                <input type="text" className="input-field" placeholder="John Doe" />
              </div>
              
              <button 
                type="submit" 
                className={`btn btn-primary payment-submit ${isProcessing ? 'processing' : ''}`}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing Transaction...' : `Pay ₹${total}`}
              </button>
              
              <p className="payment-terms">
                By clicking "Pay", you agree to the BellCorp Terms of Service and Cancellation Policy.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
