const mysql = require("mysql2");  // Ensure you are requiring mysql2
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");  // Auth routes
const userRoutes = require("./routes/user");  // User routes
const pool = require("./db");  // Database connection
const app = express();
const bodyParser = require("body-parser");

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Setup
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root", // Replace with your MySQL user
    password: process.env.DB_PASSWORD || "SQLNovak017", // Replace with your MySQL password
    database: process.env.DB_NAME || "pl_members", // Replace with your actual database name
  });

// Test the database connection
db.connect((err) => {
    if (err) {
      console.error("Database connection failed: " + err.stack);
      return;
    }
    console.log("Connected to the database");
  });

// Routes
app.use("/api/auth", authRoutes); // Authentication-related routes
app.use("/api/users", userRoutes); // User-related routes (Profile management, etc.)

// Default route to check if the server is running
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
