const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../../db");
const authMiddleware = require("../../middleware/authMiddleware");

// === Upload for primary car images ===
const imageUpload = multer({
  dest: path.join(__dirname, "../../uploads/images"),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  }
});

// === Upload for signature files ===
const signatureUpload = multer({
  dest: path.join(__dirname, "../../uploads/signatures"),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"));
  }
});

// === PUT: Update car info ===
router.put("/:id", authMiddleware, imageUpload.single("primary_image"), async (req, res) => {
  const carId = req.params.id;
  const { make, model, year, color } = req.body;
  const imageFile = req.file?.filename;

  try {
    // Build query conditionally if an image is uploaded
    const fields = [make, model, year, color];
    let query = `UPDATE cars SET make = ?, model = ?, year = ?, color = ?`;

    if (imageFile) {
      query += `, primary_image = ?`;
      fields.push(imageFile);
    }

    query += ` WHERE id = ?`;
    fields.push(carId);

    await pool.query(query, fields);
    res.json({ message: "Car updated successfully" });
  } catch (err) {
    console.error("❌ Update car error:", err);
    res.status(500).json({ error: "Failed to update car" });
  }
});

// === POST: Check In / Check Out ===
router.post("/:id/check", authMiddleware, signatureUpload.single("signature"), async (req, res) => {
  console.log("✅ Check-in/out route triggered");

  const carId = req.params.id;
  const { location, employee } = req.body;
  const userId = req.user.id;

  console.log("➡️ Car ID:", carId);
  console.log("➡️ Location:", location);
  console.log("➡️ Employee:", employee);
  console.log("🖼️ File received:", req.file);

  if (!req.file) {
    console.log("❌ No signature file received.");
    return res.status(400).json({ error: "Signature is required" });
  }

  const signatureFilename = req.file.filename;
  const signaturePath = `signatures/${signatureFilename}`;

  try {
    // Check if car exists
    const [cars] = await pool.query("SELECT user_id, checked_in FROM cars WHERE id = ?", [carId]);
    if (cars.length === 0) return res.status(404).json({ error: "Car not found" });

    const car = cars[0];
    const actionType = car.checked_in ? "out" : "in";

    // Insert check history
    await pool.query(
      `INSERT INTO check_history (car_id, user_id, employee_name, action_type, location, signature_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [carId, car.user_id, employee, actionType, location, signaturePath]
    );

    // Update car status
    await pool.query("UPDATE cars SET checked_in = ? WHERE id = ?", [actionType === "in", carId]);

    console.log(`✅ Car ${carId} checked ${actionType} by ${employee}`);
    res.json({ message: "Check status updated", action: actionType });
  } catch (err) {
    console.error("❌ Check-in/out error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.delete("/:id", authMiddleware, async (req, res) => {
      try {
        console.log("🔥 DELETE /api/admin/cars/:id hit!");
        console.log("User:", req.user);

      const carId = req.params.id;
  
      // Optional: Confirm car exists before deleting
      const [cars] = await pool.query("SELECT * FROM cars WHERE id = ?", [carId]);
      if (cars.length === 0) {
        return res.status(404).json({ error: "Car not found" });
      }
  
      await pool.query("DELETE FROM cars WHERE id = ?", [carId]);

      console.log(`✅ Car ${carId} deleted`);
      res.json({ message: "Car deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting car:", error);
      if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
    }
    const carId = req.params.id;
    res.json({ message: `Pretend we deleted car ${carId}` });
  });
module.exports = router;
