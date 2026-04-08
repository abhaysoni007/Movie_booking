import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { AuthContext } from '../context/AuthContext';
import { Download, ChevronLeft } from 'lucide-react';
import './Ticket.css';

export default function TicketView() {
  const { bookingId } = useParams();
  const { token, user } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/bookings/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const found = data.find(b => b.id === bookingId);
        setTicket(found);
        setLoading(false);
      });
  }, [bookingId, token]);

  if (loading) return <div className="flex-center" style={{ height: '70vh' }}>Generating Ticket...</div>;
  if (!ticket) return <div className="flex-center" style={{ height: '70vh' }}>Ticket not found</div>;

  return (
    <div className="container ticket-container">
      <Link to="/" className="btn btn-secondary back-btn">
        <ChevronLeft size={20} /> Back to Home
      </Link>
      
      <div className="ticket-card view-animate">
        <div className="ticket-header" style={{ backgroundImage: `url(${ticket.image_url})` }}>
          <div className="ticket-header-overlay">
            <h2>{ticket.show_name}</h2>
            <p>{new Date(ticket.show_time).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="ticket-body">
          <div className="ticket-info-grid">
            <div className="info-group">
              <label>Passenger</label>
              <p>{user.name}</p>
            </div>
            <div className="info-group">
              <label>Seat</label>
              <p className="highlight-seat">{ticket.seat_number}</p>
            </div>
            <div className="info-group">
              <label>Class</label>
              <p>{ticket.type}</p>
            </div>
            <div className="info-group">
              <label>Booking ID</label>
              <p className="small-text">{ticket.id.split('-')[0].toUpperCase()}</p>
            </div>
          </div>
          
          <div className="ticket-qr-section">
            <div className="qr-wrapper">
              <QRCodeSVG 
                value={`BELLCORP-${ticket.id}`} 
                size={160} 
                bgColor={"#ffffff"} 
                fgColor={"#000000"} 
                level={"H"} 
              />
            </div>
            <p className="qr-instruction">Show this QR code at the cinema entrance</p>
          </div>
        </div>
        
        <div className="ticket-footer">
          <button className="btn btn-primary print-btn" onClick={() => window.print()}>
            <Download size={18} /> Download Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
