const express = require("express");

const router = express.Router();

const { getWeather } = require("../controllers/weatherController");
const protect = require("../middleware/authMiddleware");

// Get current weather + 5-day forecast
router.get("/", protect, getWeather);

module.exports = router;