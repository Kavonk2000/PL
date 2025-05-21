const express = require("express");
const router = express.Router();
const pool = require("../../db");
const authMiddleware = require("../../middleware/authMiddleware");

// Get all users (admin only)
router.get("/customers", authMiddleware, async (req, res) => {
  try {
    // Check if current user is admin
    const [userResult] = await pool.query("SELECT role FROM users WHERE id = ?", [req.user.id]);
    const user = userResult[0];

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Fetch user list
    const [users] = await pool.query(
      "SELECT id, first_name, last_name, email, phone, role FROM users ORDER BY created_at DESC"
    );

    res.json(users);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/customers/:id/deactivate", authMiddleware, async (req, res) => {
    try {
      const userId = req.params.id;
      const [userResult] = await pool.query("SELECT role FROM users WHERE id = ?", [req.user.id]);
      if (!userResult[0] || userResult[0].role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }
  
      await pool.query("UPDATE users SET status = 'inactive' WHERE id = ?", [userId]);
      res.json({ message: "User deactivated" });
    } catch (err) {
      console.error("Deactivate error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  router.put("/customers/:id/deactivate", authMiddleware, async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Confirm current user is an admin
      const [adminCheck] = await pool.query("SELECT role FROM users WHERE id = ?", [req.user.id]);
      if (!adminCheck[0] || adminCheck[0].role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }
  
      // Update status
      await pool.query("UPDATE users SET status = 'inactive' WHERE id = ?", [userId]);
  
      res.json({ message: "User successfully deactivated." });
    } catch (err) {
      console.error("Deactivate error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  router.put("/customers/:id/reactivate", authMiddleware, async (req, res) => {
    try {
      const userId = req.params.id;
  
      const [adminCheck] = await pool.query("SELECT role FROM users WHERE id = ?", [req.user.id]);
      if (!adminCheck[0] || adminCheck[0].role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }
  
      await pool.query("UPDATE users SET status = 'active' WHERE id = ?", [userId]);
  
      res.json({ message: "User successfully reactivated." });
    } catch (err) {
      console.error("Reactivate error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  router.get("/customers/:id/cars", authMiddleware, async (req, res) => {
    try {
      const adminId = req.user.id;
      const targetUserId = req.params.id;
  
      const [adminCheck] = await pool.query("SELECT role FROM users WHERE id = ?", [adminId]);
      if (!adminCheck[0] || adminCheck[0].role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }
  
      const [cars] = await pool.query(
        "SELECT make, model, year, color, primary_image, created_at FROM cars WHERE user_id = ?",
        [targetUserId]
      );
  
      res.json(cars);
    } catch (err) {
      console.error("Failed to load user cars:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  router.get("/cars", authMiddleware, async (req, res) => {
    try {
      const [adminCheck] = await pool.query("SELECT role FROM users WHERE id = ?", [req.user.id]);
      if (!adminCheck[0] || adminCheck[0].role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }
  
      const [cars] = await pool.query(
        "SELECT id, user_id, make, model, year, color, primary_image, created_at, checked_in FROM cars ORDER BY created_at DESC"
      );
  
      res.json(cars);
    } catch (err) {
      console.error("Failed to load all cars:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.post("/customers/:id/add-car", authMiddleware, async (req, res) => {
    try {
      const userId = req.params.id;
      const { make, model, year, color, license_plate } = req.body;
  
      // Check if current user is admin
      const [adminCheck] = await pool.query("SELECT role FROM users WHERE id = ?", [req.user.id]);
      if (!adminCheck[0] || adminCheck[0].role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }
  
      // Insert new car
      await pool.query(
        `INSERT INTO cars (user_id, make, model, year, color, license_plate) VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, make, model, year, color, license_plate]
      );
  
      res.json({ message: "Car added successfully" });
    } catch (err) {
      console.error("Error adding car:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  router.put("/customers/:id/update", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const { first_name, last_name, email, phone, cars = [] } = req.body;

    // Confirm admin access
    const [adminCheck] = await pool.query("SELECT role FROM users WHERE id = ?", [req.user.id]);
    if (!adminCheck[0] || adminCheck[0].role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update user info
    await pool.query(
      "UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?",
      [first_name, last_name, email, phone, userId]
    );

    // Add new cars (if any)
    for (const car of cars) {
      const { make, model, year, color, license_plate } = car;
      await pool.query(
        "INSERT INTO cars (user_id, make, model, year, color, license_plate) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, make, model, year, color, license_plate]
      );
    }

    res.json({ message: "Customer and cars updated successfully." });
  } catch (err) {
    console.error("❌ Error updating customer:", err);
    res.status(500).json({ error: "Failed to update customer" });
  }
});


module.exports = router;
