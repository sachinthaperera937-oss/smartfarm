require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const farmRoutes = require("./routes/farmRoutes");
const cropRoutes = require("./routes/cropRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const protect = require("./middleware/authMiddleware");

const app = express();


// ========================================
// DATABASE
// ========================================

connectDB();


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());

app.use(express.json());


// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);

app.use("/api/farms", farmRoutes);

app.use("/api/crops", cropRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/weather", weatherRoutes);

app.use("/api/recommendations", require("./routes/recommendationRoutes"));


// ========================================
// JWT TEST ROUTE
// ========================================

app.get("/api/protected", protect, (req, res) => {

    res.json({
        success: true,
        message: "You have access to the protected route",
        user: req.user
    });

});


// ========================================
// ROOT ROUTE
// ========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "SmartFarm API is running 🌱"
    });

});


// ========================================
// HEALTH CHECK
// ========================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        status: "healthy"
    });

});


// ========================================
// SERVER
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `SmartFarm server running on http://localhost:${PORT}`
    );

});