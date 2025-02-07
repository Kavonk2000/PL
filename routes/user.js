const express = require("express");
const router = express.Router();  // Define the router here
const authMiddleware = require("../middleware/auth"); // Import your authMiddleware (if needed)

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;
    // Handle the profile update logic here (e.g., update in DB)
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
      const user = req.user; // This should be set by the authMiddleware
      res.json({ message: "User profile fetched successfully", user });
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

// More routes for the user can go here

module.exports = router;  // Export the router
