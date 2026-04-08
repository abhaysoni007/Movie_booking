console.log('🚀 Starting Cinema Booking Server...');
const express = require('express');
const cors = require('cors');

const db = require('./db.js');
const bookingsRouter = require('./routes/bookings.js');

const app = express();

const allowedOrigins = [
  'https://planmymovie.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked for origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

// ✅ OPTIONS preflight MUST be first, before everything
app.options('/{*path}', cors(corsOptions));

// ✅ Then apply CORS to all other requests
app.use(cors(corsOptions));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString() 
  });
});

app.use('/api', bookingsRouter);

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 SERVER READY ON PORT ${PORT}`);

  const SELF_URL = process.env.RENDER_EXTERNAL_URL;
  if (SELF_URL) {
    setInterval(async () => {
      try {
        const res = await fetch(`${SELF_URL}/api/health`);
        console.log(`📡 Keep-alive: ${res.status}`);
      } catch (e) {
        console.log('📡 Keep-alive failed:', e.message);
      }
    }, 14 * 60 * 1000);
  }
});