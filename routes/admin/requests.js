const express = require("express");
const router = express.Router();
const pool = require("../../db");
const authMiddleware = require("../../middleware/authMiddleware");

// Get all service/pickup requests
router.get("/requests", authMiddleware, async (req, res) => {
  try {
    const [adminCheck] = await pool.query("SELECT role FROM users WHERE id = ?", [req.user.id]);
    if (!adminCheck[0] || adminCheck[0].role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const [requests] = await pool.query(
      "SELECT id, user_id, car_id, type, status, requested_at FROM requests ORDER BY requested_at DESC"
    );

    res.json(requests);
  } catch (err) {
    console.error("Failed to fetch requests:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark request as completed
router.put("/requests/:id/complete", authMiddleware, async (req, res) => {
  try {
    const requestId = req.params.id;
    const [adminCheck] = await pool.query("SELECT role FROM users WHERE id = ?", [req.user.id]);
    if (!adminCheck[0] || adminCheck[0].role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await pool.query("UPDATE requests SET status = 'completed' WHERE id = ?", [requestId]);

    res.json({ message: "Request marked as completed." });
  } catch (err) {
    console.error("Failed to update request:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
