import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import TicketView from './pages/TicketView';
import MyBookings from './pages/MyBookings';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/book/:showId" element={<BookingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/ticket/:bookingId" element={<TicketView />} />
          <Route path="/bookings" element={<MyBookings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
