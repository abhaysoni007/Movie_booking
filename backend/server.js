const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const bookingsRouter = require('./routes/bookings.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api', bookingsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Cinema booking server running on port ${PORT}`);
});
