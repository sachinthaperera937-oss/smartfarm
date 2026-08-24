const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getDashboard
} = require("../controllers/dashboardController");


// GET DASHBOARD DATA
// GET /api/dashboard

router.get("/", protect, getDashboard);


module.exports = router;