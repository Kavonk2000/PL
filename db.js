const mysql = require('mysql2');

// Create a pool of connections to the MySQL database
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Change if needed
  password: 'SQLNovak017', // Change if needed
  database: 'pl_members', // Ensure the database name is correct
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Use promise wrapper for async/await support
const promisePool = pool.promise();

// Test the connection to ensure it's working correctly
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database as id ' + connection.threadId);
  connection.release(); // Release the connection back to the pool
});

// Export the promisePool for use in other files
module.exports = promisePool;
