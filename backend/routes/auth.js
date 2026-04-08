const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db.js');
const { randomUUID: uuidv4 } = require('crypto');
const { asyncHandler } = require('../utils.js');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-bellcorp';

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // Check if email exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  
  db.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)')
    .run(id, name, email, hash);
  
  const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' });
  
  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: { id, name, email }
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
}));

router.get('/me', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(decoded.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  res.json({ user });
}));

module.exports = { router, JWT_SECRET };
