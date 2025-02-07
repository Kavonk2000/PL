const jwt = require('jsonwebtoken');

// This middleware function will check if the request contains a valid token
const authMiddleware = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // If no token is found, return an error
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, 'supersecretkey12345'); // Replace 'your_jwt_secret' with your actual secret key

    // Add the decoded user info to the request (so it can be accessed in the route handler)
    req.user = decoded;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    // If the token is invalid or expired, return an error
    return res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
