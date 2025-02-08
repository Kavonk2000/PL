const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// **Set up Multer for file uploads (profile picture)**
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles"); // Store files in 'uploads/profiles' directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Store with timestamp to avoid filename conflicts
  },
});

const upload = multer({ storage });

// **User Registration**
router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Check if user exists
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Username or email already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    await pool.query(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// **User Login**
router.post("/login", async (req, res) => {
  console.log("Incoming login request body:", req.body);
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    console.log("Missing emailOrUsername or password in request.");
    return res.status(400).json({ error: "Username/email and password are required" });
  }

  try {
    console.log("Attempting login with:", emailOrUsername);

    // Query for user by username OR email
    const [users] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [emailOrUsername, emailOrUsername]
    );

    if (users.length === 0) {
      console.log("No user found with the given username/email.");
      return res.status(400).json({ error: "Invalid username/email or password" });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("Password does not match.");
      return res.status(400).json({ error: "Invalid username/email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Login successful! Token generated.");
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// **Profile Picture Upload (Protected)**
router.post("/profile-picture", authMiddleware, upload.single("profile_picture"), async (req, res) => {
  try {
    const userId = req.user.id;
    const profilePicture = req.file ? req.file.filename : null;

    if (!profilePicture) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Update the user's profile picture in the database
    await pool.query(
      "UPDATE users SET profile_picture = ? WHERE id = ?",
      [profilePicture, userId]
    );

    res.json({ message: "Profile picture uploaded successfully", profile_picture: profilePicture });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    res.status(500).json({ error: "Error uploading profile picture" });
  }
});

// **Get User Profile (Protected)**
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details from the database
    const [users] = await pool.query(
      "SELECT id, username, email, profile_picture FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
