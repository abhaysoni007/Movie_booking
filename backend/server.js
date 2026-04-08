const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const bookingsRouter = require('./routes/bookings.js');
const { router: authRouter } = require('./routes/auth.js');

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
      callback(new Error('CORS not allowed for: ' + origin));
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle preflight for ALL routes FIRST before anything else
// REPLACE with:
app.options('/{*path}', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api', bookingsRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cinema booking server running on port ${PORT}`);

  // Keep Render free tier alive (pings every 14 min)
  const SELF_URL = process.env.RENDER_EXTERNAL_URL;
  if (SELF_URL) {
    setInterval(async () => {
      try {
        const res = await fetch(`${SELF_URL}/api/health`);
        console.log(`Keep-alive ping: ${res.status}`);
      } catch (e) {
        console.log('Keep-alive failed:', e.message);
      }
    }, 14 * 60 * 1000);
  }
});