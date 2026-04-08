const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const bookingsRouter = require('./routes/bookings.js');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
}));
app.use(express.json());

// Mount routers
app.use('/api', bookingsRouter);

// Start server
app.listen(process.env.PORT || 5000, () => {
  console.log('Server running');
});
