// routes/vitals.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); // Added mongoose import
const Vitals = require("../models/Vitals");
const UserDetails = require("../models/User");

// Helper Functions
function calculateMaintenanceCalories(
  weight,
  height,
  age,
  gender,
  activityLevel
) {
  let bmr;
  if (gender === "male") {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }

  let activityMultiplier;
  switch (activityLevel) {
    case "sedentary":
      activityMultiplier = 1.2;
      break;
    case "lightly active":
      activityMultiplier = 1.375;
      break;
    case "moderately active":
      activityMultiplier = 1.55;
      break;
    case "very active":
      activityMultiplier = 1.725;
      break;
    case "super active":
      activityMultiplier = 1.9;
      break;
    default:
      activityMultiplier = 1.2;
  }

  return bmr * activityMultiplier;
}

function calculateDailyMacros(weight, calories) {
  const proteinPercentage = 0.3;
  const carbPercentage = 0.4;
  const fatPercentage = 0.3;

  const proteinCalories = calories * proteinPercentage;
  const carbCalories = calories * carbPercentage;
  const fatCalories = calories * fatPercentage;

  const proteinGrams = proteinCalories / 4;
  const carbGrams = carbCalories / 4;
  const fatGrams = fatCalories / 9;

  return {
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
  };
}

function calculateBMI(weight, height) {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

// POST /api/vitals - Create a new vitals entry
router.post("/add", async (req, res) => {
  try {
    console.log("Decoded token:", req.user);
    const { sugarReading, weightReading } = req.body;

    // Access userId from the token
    const userId = req.user.userId;

    console.log("Using userId:", userId);

    if (!sugarReading || !weightReading) {
      return res.status(400).json({ message: "All fields are required." });
    }
    
    const objectIdUserId = new mongoose.Types.ObjectId(userId);
    const existingUserDetails = await UserDetails.findOne({
    userId: objectIdUserId,
    });

    if (!existingUserDetails) {
      return res
        .status(404)
        .json({
          message: "User details not found. Please set up your profile first.",
        });
    }

    console.log("UserDetails.findOne() result:", existingUserDetails);
    // const existingUserDetails = await UserDetails.findOne({ userId });

    const maintenanceCalories = calculateMaintenanceCalories(
      weightReading,
      existingUserDetails.height,
      existingUserDetails.age,
      existingUserDetails.gender,
      existingUserDetails.activityLevel
    );

    const adjustedCalories =
      maintenanceCalories + (existingUserDetails.weightGoal * 7700) / 7;

    const dailyMacros = calculateDailyMacros(weightReading, adjustedCalories);

    const updatedUserDetails = await UserDetails.findOneAndUpdate(
      { userId },
      {
        weight: weightReading,
        maintenanceCalories: adjustedCalories,
        dailyMacros: dailyMacros,
        bmi: calculateBMI(weightReading, existingUserDetails.height),
      },
      { new: true }
    );

    // Convert userId to ObjectId when creating the vitals document
    const vitals = await Vitals.create({
      userId: mongoose.Types.ObjectId(userId),
      sugarReading,
      weightReading,
    });

    res.status(201).json({
      success: true,
      message: "Vitals added successfully!",
      vitals,
      userDetails: updatedUserDetails,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong. Please try again.",
      });
  }
});


module.exports = router;
