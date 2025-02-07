const db = require("../db"); // Import database connection
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../db"); // DB connection
const authMiddleware = require("../middleware/authMiddleware"); // Middleware for protecting routes
const router = express.Router();
//const User = require('../models/User');


// Registration Route
router.post("/register", (req, res) => {
    const { username, password, email } = req.body;
  
    // Check if user exists
    db.query("SELECT * FROM users WHERE username = ?", [username], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (result.length > 0) {
        return res.status(400).json({ error: "Username already taken" });
      }
  
      // Hash the password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ error: "Error hashing password" });
        }
  
        // Insert new user
        db.query(
          "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
          [username, hashedPassword, email],
          (err, result) => {
            if (err) {
              return res.status(500).json({ error: "Error saving user" });
            }
            return res.status(201).json({ message: "User registered successfully" });
          }
        );
      });
    });
  });

// **Login User**
// Login Route
router.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    db.query("SELECT * FROM users WHERE username = ?", [username], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (result.length === 0) {
        return res.status(400).json({ error: "Invalid username or password" });
      }
  
      // Compare password
      bcrypt.compare(password, result[0].password, (err, match) => {
        if (err || !match) {
          return res.status(400).json({ error: "Invalid username or password" });
        }
  
        // Create JWT token
        const token = jwt.sign({ id: result[0].id }, "supersecretkey12345", {
          expiresIn: "1h",
        });
  
        return res.json({ message: "Login successful", token });
      });
    });
  });

// **Get User Profile (Protected Route)**
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extracted from the token

        // Fetch user details from the database
        const [users] = await pool.query("SELECT id, username, email FROM users WHERE id = ?", [userId]);

        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(users[0]);
    } catch (error) {
        console.error("Profile retrieval error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// **Update User Profile (username, email, etc.)**
router.put("/update", authMiddleware, async (req, res) => {
    const { username, email } = req.body;
    const userId = req.user.id; // From the token

    if (!username || !email) {
        return res.status(400).json({ error: "Username and email are required" });
    }

    try {
        // Update the user details in the database
        await pool.query(
            "UPDATE users SET username = ?, email = ? WHERE id = ?",
            [username, email, userId]
        );

        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// **Change Password**
router.put("/change-password", authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From the token

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Both current and new password are required" });
    }

    try {
        // Fetch user from DB
        const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
        const user = users[0];

        // Check if the current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect current password" });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, userId]);

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Password change error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
