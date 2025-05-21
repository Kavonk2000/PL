const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");






// Ensure uploads directory exists
const profileUploadPath = path.join(__dirname, "..", "uploads", "profiles");
if (!fs.existsSync(profileUploadPath)) {
  fs.mkdirSync(profileUploadPath, { recursive: true });
}

// **Set up Multer for file uploads**
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// **User Registration**
router.post("/register", async (req, res) => {
  const { first_name, last_name, email, password, phone } = req.body;

  try {
    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (first_name, last_name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, phone]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// **User Login**
router.post("/login", async (req, res) => {
  console.log("Login route hit!");
  const { emailOrUsername, password } = req.body;

  

  try {
    console.log("Login attempt for:", emailOrUsername);

    // Get user by email or username
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ? OR username = ?", 
      [emailOrUsername, emailOrUsername]
    );

    console.log("Query results:", users);

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log("Creating token...");
    console.log("JWT Secret:", process.env.JWT_SECRET);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    let redirectUrl = "/HTML/dashboard.html";
    if (user.role === "admin") {
      redirectUrl = "/HTML/admin/dashboardA.html"
    }
    res.json({ token, role: user.role, redirectUrl });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// **Profile Picture Upload**
router.post("/profile-picture", authMiddleware, upload.single("profile_picture"), async (req, res) => {
  try {
    const userId = req.user.id;
    const profilePicture = req.file ? req.file.filename : null;

    if (!profilePicture) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    await pool.query("UPDATE users SET profile_picture = ? WHERE id = ?", [profilePicture, userId]);

    res.json({ message: "Profile picture uploaded successfully", profile_picture: profilePicture });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    res.status(500).json({ error: "Error uploading profile picture" });
  }
});

// **Get User Profile**
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      "SELECT id, first_name, last_name, email, profile_picture FROM users WHERE id = ?",
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
