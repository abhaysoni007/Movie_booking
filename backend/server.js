console.log('🚀 Starting Cinema Booking Server...');

const express = require('express');
const cors = require('cors');

const db = require('./db.js');
const bookingsRouter = require('./routes/bookings.js');

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  'https://planmymovie.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
];

// ✅ CORS configuration (fixed)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman / server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked for origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// ✅ VERY IMPORTANT: handle preflight correctly
app.options('*', cors(corsOptions));

// ✅ Apply CORS middleware
app.use(cors(corsOptions));

// ✅ Body parser
app.use(express.json());

// ✅ Health route (for testing + Render)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ✅ API routes
app.use('/api', bookingsRouter);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS blocked this request' });
  }

  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 SERVER READY ON PORT ${PORT}`);

  // ✅ Keep-alive for Render free tier
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