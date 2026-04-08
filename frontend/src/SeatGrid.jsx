function SeatGrid({ seats, onSeatToggle, selectedSeats, availableCount }) {
  // Create a 5x4 grid (5 columns, 4 rows)
  const grid = [];
  for (let i = 0; i < 4; i++) {
    const row = [];
    for (let j = 0; j < 5; j++) {
      row.push(seats[i * 5 + j]);
    }
    grid.push(row);
  }

  return (
    <div className="seat-grid-container">
      <h3>Select Your Seats</h3>
      
      <div className="legend">
        <div className="legend-item">
          <div className="seat-btn available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="seat-btn selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="seat-btn booked"></div>
          <span>Booked</span>
        </div>
      </div>

      <div className="seats-grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            {row.map((seat) => {
              const isSelected = selectedSeats.includes(seat.seat_number);
              const isBooked = seat.status === 'booked';
              let className = 'seat-btn';
              
              if (isBooked) {
                className += ' booked';
              } else if (isSelected) {
                className += ' selected';
              } else {
                className += ' available';
              }

              return (
                <button
                  key={seat.seat_number}
                  className={className}
                  onClick={() => !isBooked && onSeatToggle(seat.seat_number)}
                  disabled={isBooked}
                  title={isBooked ? `Booked by ${seat.user_name}` : `Seat ${seat.seat_number}`}
                >
                  {seat.seat_number}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {availableCount > 0 && (
        <p className="seats-remaining">{availableCount} seats remaining</p>
      )}
    </div>
  );
}

export default SeatGrid;
