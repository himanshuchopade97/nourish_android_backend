require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const foodRoutes = require("./routes/food");
const vitalsRoutes = require("./routes/vitals"); 
const authMiddleware = require("./middleware/authMiddleware"); // ✅ Import middleware

const app = express();


// ✅ MiddlewareSSSsdd
app.use(express.json());
app.use(
  cors({
    origin:"*", // 🔒 Replace '*' with your Flutter app URL for security
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/food", authMiddleware, foodRoutes); // Protected food routes
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/vitals", authMiddleware, vitalsRoutes);


// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)

  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // 🔥 Exit if DB connection fails
  });

// Handle MongoDB disconnects
mongoose.connection.on("disconnected", () => {
  console.error("⚠️ MongoDB Disconnected. Reconnecting...");
});

// ✅ Global Error Handling
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
