const BASE_URL = 'http://localhost:5000/api';

export { BASE_URL };

export async function getShows() {
  const response = await fetch(`${BASE_URL}/shows`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch shows');
  }
  return response.json();
}

export async function getSeats(showId) {
  const response = await fetch(`${BASE_URL}/shows/${showId}/seats`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch seats');
  }
  return response.json();
}

export async function bookTickets(showId, seatNumbers, userName) {
  const response = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      show_id: showId,
      seat_numbers: seatNumbers,
      user_name: userName
    })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to book tickets');
  }
  return response.json();
}

export async function cancelBooking(bookingId) {
  const response = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel booking');
  }
  return response.json();
}
