// Import required modules
const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const port = 5000;

// Middleware to parse JSON data in incoming requests
app.use(express.json());  // This is required to parse JSON bodies

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'SQLNovak017',  // Make sure your password is correct here
  database: 'pl_members'
});

// Check database connection
db.connect((err) => {
  if (err) {
    console.log('Database connection failed:', err.message);
  } else {
    console.log('Database connected!');
  }
});

// Sample login route (adjust as needed)
app.post('/login', (req, res) => {
  console.log(req.body);  // Log the incoming request body for debugging

  const { username, password } = req.body;  // Destructure username and password from request body

  // Perform login logic (e.g., check credentials in the database)
  if (username && password) {
    // Example query - adjust to your actual query logic
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
      if (err) {
        console.log('Error querying the database:', err.message);
        return res.status(500).json({ error: 'Database query failed' });
      }

      if (results.length > 0) {
        // User found, send success response
        return res.json({ message: 'Login successful', user: results[0] });
      } else {
        // User not found, send error response
        return res.status(401).json({ error: 'Invalid username or password' });
      }
    });
  } else {
    return res.status(400).json({ error: 'Username and password are required' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
