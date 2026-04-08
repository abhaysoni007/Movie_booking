console.log('🚀 Starting Cinema Booking Server...');

const express = require('express');
const cors = require('cors');

const db = require('./db.js');
const bookingsRouter = require('./routes/bookings.js');

const app = express();

// ✅ Allowed origins (STRICT + SAFE)
const allowedOrigins = [
  'https://planmymovie.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
];

// ✅ CORS (SIMPLIFIED + RELIABLE)
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ FORCE HANDLE PREFLIGHT (THIS FIXES YOUR ERROR)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(200);
  }
  next();
});

// ✅ Body parser
app.use(express.json());

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ✅ API routes
app.use('/api', bookingsRouter);

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 SERVER READY ON PORT ${PORT}`);

  const SELF_URL = process.env.RENDER_EXTERNAL_URL;

  // ✅ Keep-alive (Render free tier fix)
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