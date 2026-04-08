const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const bookingsRouter = require('./routes/bookings.js');
const { router: authRouter } = require('./routes/auth.js');

const app = express();

const corsOptions = {
  origin: [
    process.env.CLIENT_URL || 'https://planmymovie.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api', bookingsRouter);

// Start server
app.listen(process.env.PORT || 5000, () => {
  console.log('Server running on port', process.env.PORT || 5000);
});
