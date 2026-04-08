import { useState, useEffect } from 'react'
import { getShows, getSeats } from './api'
import SeatGrid from './SeatGrid'
import BookingPanel from './BookingPanel'
import './App.css'

function App() {
  const [shows, setShows] = useState([])
  const [selectedShow, setSelectedShow] = useState(null)
  const [seatData, setSeatData] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch shows on mount
  useEffect(() => {
    fetchShows()
  }, [])

  const fetchShows = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getShows()
      setShows(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleShowSelect = async (show) => {
    setSelectedShow(show)
    setSelectedSeats([])
    setLoading(true)
    setError(null)
    try {
      const data = await getSeats(show.id)
      setSeatData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSeatToggle = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    )
  }

  const handleBookingSuccess = async () => {
    setSelectedSeats([])
    if (selectedShow) {
      try {
        const data = await getSeats(selectedShow.id)
        setSeatData(data)
      } catch (err) {
        setError(err.message)
      }
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎬 CineBook</h1>
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="container">
        <div className="show-selector">
          <h2>Select a Show</h2>
          {loading && !selectedShow ? (
            <p>Loading shows...</p>
          ) : (
            <div className="shows-list">
              {shows.map((show) => (
                <button
                  key={show.id}
                  className={`show-card ${selectedShow?.id === show.id ? 'active' : ''}`}
                  onClick={() => handleShowSelect(show)}
                >
                  <strong>{show.name}</strong>
                  <p>{show.show_time}</p>
                  <p className="seats-info">
                    {show.available_seats}/{show.total_seats} seats available
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedShow && seatData && (
          <div className="booking-section">
            {seatData.seats.every((s) => s.status === 'booked') ? (
              <div className="fully-booked">
                <p>⚠️ This show is fully booked</p>
              </div>
            ) : (
              <>
                <SeatGrid
                  seats={seatData.seats}
                  selectedSeats={selectedSeats}
                  onSeatToggle={handleSeatToggle}
                  availableCount={seatData.show.total_seats - seatData.seats.filter(s => s.status === 'booked').length}
                />
                <BookingPanel
                  selectedSeats={selectedSeats}
                  seatData={seatData}
                  showId={selectedShow.id}
                  onBookingSuccess={handleBookingSuccess}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
