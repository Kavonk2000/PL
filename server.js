require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const carsRoutes = require("./routes/cars");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// Middleware
const corsOptions = {
  origin: "http://localhost:5000",  // Frontend origin
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization",
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));
console.log("📂 Static files served from:", path.join(__dirname, 'public'));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cars", carsRoutes);

// Admin API Routes
app.use("/api/admin/cars", require("./routes/admin/cars"));
app.use("/api/admin", require("./routes/admin/users"));
app.use("/api/admin", require("./routes/admin/requests"));
app.use("/api/admin", require("./routes/admin/reports"));

// Page Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "HTML", "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "HTML", "dashboard.html"));
});

app.get("/cars", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "HTML", "cars.html"));
});

app.get("/ln", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "HTML", "LN.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "API is running..." });
});

// Handle 404s
app.use((req, res, next) => {
  const notFoundPage = path.join(__dirname, "public", "HTML", "404.html");
  res.status(404).sendFile(notFoundPage, (err) => {
    if (err) {
      res.status(404).send("404 - Page Not Found");
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
