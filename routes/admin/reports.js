const express = require("express");
const router = express.Router();
const pool = require("../../db");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/reports", authMiddleware, async (req, res) => {
  try {
    const [adminCheck] = await pool.query("SELECT role FROM users WHERE id = ?", [req.user.id]);
    if (!adminCheck[0] || adminCheck[0].role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const [expiredRegistrations] = await pool.query(`
      SELECT id AS car_id, user_id, make, model, registration_expiry
      FROM cars
      WHERE registration_expiry < CURDATE()
    `);

    const [inactiveCars] = await pool.query(`
      SELECT c.id AS car_id, c.user_id, c.make, c.model, MAX(h.checked_in_at) AS last_check_in
      FROM cars c
      LEFT JOIN history h ON h.car_id = c.id
      GROUP BY c.id
      HAVING last_check_in IS NULL OR last_check_in < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    const [topCustomers] = await pool.query(`
      SELECT u.id AS user_id, CONCAT(u.first_name, ' ', u.last_name) AS name, COUNT(h.id) AS total_check_ins
      FROM users u
      JOIN cars c ON u.id = c.user_id
      JOIN history h ON h.car_id = c.id
      GROUP BY u.id
      ORDER BY total_check_ins DESC
      LIMIT 10
    `);

    res.json({
      expiredRegistrations,
      inactiveCars,
      topCustomers
    });
  } catch (err) {
    console.error("Failed to generate reports:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
