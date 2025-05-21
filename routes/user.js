const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// **Set up multer for image uploads**
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// **Get User Profile (Protected)**
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      "SELECT id, first_name, last_name, email, phone, profile_picture FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// **Update User Profile (Protected)**
router.put("/profile", authMiddleware, upload.single('profile_picture'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, email, phone } = req.body;
    const profilePicture = req.file ? req.file.filename : null; // Handle file upload

    if (!first_name && !last_name && !email && !phone && !profilePicture) {
      return res.status(400).json({ error: "At least one field must be updated" });
    }

    const updates = [];
    const values = [];

    if (first_name) {
      updates.push("first_name = ?");
      values.push(first_name);
    }

    if (last_name) {
      updates.push("last_name = ?");
      values.push(last_name);
    }

    if (email) {
      updates.push("email = ?");
      values.push(email);
    }

    if (phone) {
      updates.push("phone = ?");
      values.push(phone);
    }

    if (profilePicture) {
      updates.push("profile_picture = ?");
      values.push(profilePicture);
    }

    values.push(userId);

    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Profile update failed" });
    }

    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// **Update User Profile (first name, last name, email, phone)**
router.put("/profile", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, email, phone } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: "First name, last name, and email are required." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?",
      [first_name, last_name, email, phone || null, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found or no changes made" });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Database error" });
  }
});


module.exports = router;
