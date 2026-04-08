console.log('🚀 Starting Cinema Booking Server...');

const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const bookingsRouter = require('./routes/bookings.js');
const { asyncHandler } = require('./utils.js');

const app = express();

// 1️⃣ MIDDLEWARE: Request Logger (Observability)
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin || 'N/A'}`);
  next();
});

// 2️⃣ MIDDLEWARE: Timeout Guard (Anti-Hang)
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error(`⏱️ Request Timeout: ${req.method} ${req.originalUrl}`);
      res.status(504).json({ error: 'Request timeout' });
    }
  }, 8000); // 8 seconds

  res.on('finish', () => clearTimeout(timeout));
  next();
});

// 3️⃣ MIDDLEWARE: Response Safety Guard (No Double Headers)
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (res.headersSent) {
      console.error(`🚨 DOUBLE RESPONSE DETECTED: ${req.method} ${req.originalUrl}`);
      return;
    }
    return originalSend.call(this, body);
  };
  next();
});

// 4️⃣ MIDDLEWARE: Production CORS (Dynamic & Tight)
const allowedOrigins = [
  'https://planmymovie.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    const isMatch = allowedOrigins.includes(origin) || 
                    origin.endsWith('.vercel.app') || 
                    origin.includes('localhost');

    if (isMatch) {
      callback(null, true);
    } else {
      console.warn(`🔒 CORS Blocked Origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
}));

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

// ✅ 5️⃣ GLOBAL ERROR HANDLER (CORS-AWARE)
app.use((err, req, res, next) => {
  console.error('🔥 SERVER ERROR:', err.stack || err.message);

  // Force attach CORS headers during errors to prevent browser masking
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    path: req.originalUrl
  });
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