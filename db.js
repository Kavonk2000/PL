const mysql = require("mysql2");
require("dotenv").config(); // Load environment variables from .env

// Create a pool of connections to the MySQL database
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "SQLNovak017", // Use the correct variable for password
  database: process.env.DB_NAME || "pl_members",
  port: process.env.DB_PORT || 3306, // Default MySQL port if not provided
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Use promise wrapper for async/await support
const db = pool.promise();

// Test the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection error:", err.code, err.message);
    return;
  }
  console.log("✅ Connected to the database as ID " + connection.threadId);
  connection.release();
});

module.exports = db;
