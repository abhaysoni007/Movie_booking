import { useState, useEffect } from 'react';
import { apiFetch } from '../apiClient';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import './Home.css';

export default function Home() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/shows')
      .then(res => res.json())
      .then(data => {
        setShows(data);
        setLoading(false);
      });
  }, []);

  const featuredShow = shows.length > 0 ? shows[0] : null;

  if (loading) {
    return <div className="flex-center" style={{ height: '50vh' }}>Loading immersive experiences...</div>;
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      {featuredShow && (
        <div className="hero-section" style={{ backgroundImage: `url(${featuredShow.image_url})` }}>
          <div className="hero-overlay"></div>
          <div className="container hero-content">
            <h1 className="hero-title">{featuredShow.name}</h1>
            <p className="hero-subtitle">Experience cinema like never before. Premium seating, state-of-the-art acoustics.</p>
            <div className="hero-actions">
              <Link to={`/book/${featuredShow.id}`} className="btn btn-primary hero-btn">
                <Play fill="white" size={20} />
                Book Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Now Showing Section */}
      <div className="container sections-container">
        <h2 className="section-title">Now Showing</h2>
        <div className="shows-grid">
          {shows.map(show => (
            <div key={show.id} className="movie-card glass-panel">
              <div className="card-image" style={{ backgroundImage: `url(${show.image_url})` }}>
                <div className="card-overlay">
                  {show.available_seats > 0 ? (
                    <Link to={`/book/${show.id}`} className="btn btn-primary card-btn">Book Tickets</Link>
                  ) : (
                    <button className="btn btn-secondary card-btn" disabled>Sold Out</button>
                  )}
                </div>
              </div>
              <div className="card-info">
                <h3>{show.name}</h3>
                <div className="card-details">
                  <span className="card-time">{new Date(show.show_time).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}</span>
                  <span className="audi-badge">{show.audi}</span>
                </div>
                <div className="card-meta">
                  <span className="price-tag">From ₹{show.price_base}</span>
                  <span className={`seats-badge ${show.available_seats === 0 ? 'sold-out' : ''}`}>
                    {show.available_seats} left
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
