const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Centralized fetch with retries and timeout
export const apiFetch = async (endpoint, options = {}, retries = 3, backoff = 300) => {
  const timeout = options.timeout || 10000;
  const url = `${BASE_URL}${endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`}`;
  
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
    }
  }
};

// Auth
export async function login(email, password) {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function register(name, email, password) {
  const response = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function getAuthMe(token) {
  const response = await apiFetch('/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch user');
  return data;
}

// Shows
export async function getShows() {
  const response = await apiFetch('/shows');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch shows');
  }
  return response.json();
}

export async function getSeats(showId) {
  const response = await apiFetch(`/shows/${showId}/seats`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch seats');
  }
  return response.json();
}

// Bookings
export async function createBooking(showId, seatNumbers, token) {
  const response = await apiFetch('/bookings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      show_id: showId,
      seat_numbers: seatNumbers
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to book tickets');
  return data;
}

export async function getUserBookings(token) {
  const response = await apiFetch('/bookings/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch bookings');
  return data;
}

export async function cancelBooking(bookingId, token) {
  const response = await apiFetch(`/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to cancel booking');
  return data;
}
