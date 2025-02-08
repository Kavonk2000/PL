const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");  // Authentication routes
const userRoutes = require("./routes/user");  // User-related routes
const carsRoutes = require("./routes/cars");  // Car management routes
const pool = require("./db");  // Database connection

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

// Static file serving (for profile pictures or other uploads)
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes); // Authentication-related routes
app.use("/api/users", userRoutes); // User-related routes (profile management, etc.)
app.use("/api/cars", carsRoutes);  // Car-related routes (car management)

// Default route to check if the server is running
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
