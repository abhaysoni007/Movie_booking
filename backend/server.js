const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const bookingsRouter = require('./routes/bookings.js');
const { router: authRouter } = require('./routes/auth.js');

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  'https://planmymovie.vercel.app'
];

// ✅ Robust CORS config
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// ✅ Apply CORS (this already handles preflight)
app.use(cors(corsOptions));

// Body parser
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api', bookingsRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});