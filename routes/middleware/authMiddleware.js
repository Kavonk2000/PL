// authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();  // Load .env file

const SECRET_KEY = process.env.JWT_SECRET;  // Use the value from .env

module.exports = (req, res, next) => {
  console.log('Entering Authentication Middleware...');

  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log('No token found');
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    console.log('User authenticated');
    next();
  } catch (error) {
    console.log('Invalid token or authentication failed');
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

