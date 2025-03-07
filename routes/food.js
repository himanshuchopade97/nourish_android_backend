const express = require("express");
const Food = require("../models/Food");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Store food data
router.post("/add-food", authMiddleware, async (req, res) => {
    const { food_name, protein_g, carb_g, fat_g, fibre_g, energy_kcal, glycemic_index, userId } = req.body; // Include userId

    if (!food_name) {
        return res.status(400).json({ message: "No food selected!" });
    }

    try {
        const food = await Food.create({
            userId: userId, // Use the extracted userId
            food_name,
            protein_g,
            carb_g,
            fat_g,
            fibre_g,
            energy_kcal,
            glycemic_index: glycemic_index ?? null,
            createdAt: new Date(),
        });

        res.json({ message: "Food added successfully", food });
    } catch (err) {
        console.error("Error adding food:", err);
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: "Validation error", errors: err.errors });
        }
        res.status(500).json({ message: "Error adding food" });
    }
});


router.get("/get-food",authMiddleware, async (req, res) => {
    const userId = req.query.userId; 
  
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const foods = await Food.find({ userId: userId });
        res.json(foods);
    } catch (err) {
        console.error("Error fetching foods for dashboard:", err);
        res.status(500).json({ message: "Error fetching foods" });
    }
});

module.exports = router;