const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createFarm,
    getMyFarms,
    getFarmById,
    updateFarm,
    deleteFarm
} = require("../controllers/farmController");


// GET ALL FARMS FOR LOGGED-IN USER
// GET /api/farms
router.get("/", protect, getMyFarms);


// CREATE FARM
// POST /api/farms
router.post("/", protect, createFarm);


// GET SINGLE FARM
// GET /api/farms/:id
router.get("/:id", protect, getFarmById);


// UPDATE FARM
// PUT /api/farms/:id
router.put("/:id", protect, updateFarm);


// DELETE FARM
// DELETE /api/farms/:id
router.delete("/:id", protect, deleteFarm);


module.exports = router;