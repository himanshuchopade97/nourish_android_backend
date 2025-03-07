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
    const foodName = req.query.foodName;

    if (userId) {
        // Fetch all foods for a user (for food history)
        try {
            const foods = await Food.find({ userId: userId });
            res.json(foods);
        } catch (err) {
            console.error("Error fetching foods for user:", err);
            res.status(500).json({ message: "Error fetching foods" });
        }
    } else if (foodName) {
        // Fetch a single food item by name
        try {
            const food = await Food.findOne({ food_name: foodName });
            if (food) {
                res.json({
                    food_name: food.food_name,
                    protein: food.protein_g,
                    fats: food.fat_g,
                    carbs: food.carb_g,
                    fiber: food.fibre_g,
                    energy_kcal: food.energy_kcal,
                    glycemic_index: food.glycemic_index,
                });
            } else {
                res.status(404).json({ message: "Food not found" });
            }
        } catch (err) {
            console.error("Error fetching food by name:", err);
            res.status(500).json({ message: "Error fetching food" });
        }
    } else {
        return res.status(400).json({ message: "Either userId or foodName is required" });
    }
});

module.exports = router;