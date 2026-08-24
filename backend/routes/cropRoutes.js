const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createCrop,
    getMyCrops,
    getCropById,
    updateCrop,
    deleteCrop
} = require("../controllers/cropController");


// ========================================
// GET ALL CROPS
// GET /api/crops
// ========================================
router.get("/", protect, getMyCrops);


// ========================================
// CREATE CROP
// POST /api/crops
// ========================================
router.post("/", protect, createCrop);


// ========================================
// GET SINGLE CROP
// GET /api/crops/:id
// ========================================
router.get("/:id", protect, getCropById);


// ========================================
// UPDATE CROP
// PUT /api/crops/:id
// ========================================
router.put("/:id", protect, updateCrop);


// ========================================
// DELETE CROP
// DELETE /api/crops/:id
// ========================================
router.delete("/:id", protect, deleteCrop);


module.exports = router;