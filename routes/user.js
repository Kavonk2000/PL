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

// Route to update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { email, password, profilePicture } = req.body; // Assuming these fields are being sent in the request

  // Ensure user is logged in
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Validate inputs (you can add more validation here, e.g., for email format or password complexity)
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Update the user's profile in the database
    const [result] = await db.execute(
      'UPDATE users SET email = ?, password = ?, profile_picture = ? WHERE id = ?',
      [email, password, profilePicture || null, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Failed to update user profile' });
    }

    res.status(200).json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the profile' });
  }
});


module.exports = router;  // Export the router
