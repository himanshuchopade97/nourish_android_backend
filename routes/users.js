const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// GET /profile (protected route)
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized access" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const { password, ...userData } = user.toObject();
        res.json({...userData, email: user.email});
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /profile (protected route)
router.put("/profile", authMiddleware, async (req, res) => {
  try {
      const userId = req.user.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized access" });

      const { firstname, lastname, contact, email } = req.body; // Add email

      const updatedUser = await User.findByIdAndUpdate(
          userId,
          { firstName: firstname, lastName: lastname, contact, email }, // Add email
          { new: true, runValidators: true }
      );

      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      res.json(updatedUser);
  } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;