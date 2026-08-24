const Crop = require("../models/Crop");
const Farm = require("../models/Farm");


// ========================================
// CREATE CROP
// POST /api/crops
// ========================================
const createCrop = async (req, res) => {
    try {
        const {
            name,
            farm,
            plantingDate,
            expectedHarvestDate,
            status
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !farm ||
            !plantingDate ||
            !expectedHarvestDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, farm, plantingDate and expectedHarvestDate"
            });
        }

        // Check that the farm exists
        // and belongs to the logged-in user
        const existingFarm = await Farm.findOne({
            _id: farm,
            owner: req.user.id
        });

        if (!existingFarm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found or you do not have access to it"
            });
        }

        // Create crop
        const crop = await Crop.create({
            name: name.trim(),
            farm,
            plantingDate,
            expectedHarvestDate,
            status: status || "planned"
        });

        return res.status(201).json({
            success: true,
            message: "Crop created successfully",
            crop
        });

    } catch (error) {
        console.error("Create crop error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating crop"
        });
    }
};


// ========================================
// GET ALL CROPS FOR LOGGED-IN USER
// GET /api/crops
// ========================================
const getMyCrops = async (req, res) => {
    try {
        // Find farms owned by the logged-in user
        const farms = await Farm.find({
            owner: req.user.id
        }).select("_id");

        // Extract farm IDs
        const farmIds = farms.map((farm) => farm._id);

        // Find crops belonging to those farms
        const crops = await Crop.find({
            farm: {
                $in: farmIds
            }
        }).populate("farm");

        return res.status(200).json({
            success: true,
            count: crops.length,
            crops
        });

    } catch (error) {
        console.error("Get crops error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching crops"
        });
    }
};
// ========================================
// GET SINGLE CROP BY ID
// GET /api/crops/:id
// ========================================
const getCropById = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id)
            .populate("farm");

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found"
            });
        }

        // Check that the farm belongs to the logged-in user
        if (crop.farm.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this crop"
            });
        }

        return res.status(200).json({
            success: true,
            crop
        });

    } catch (error) {
        console.error("Get crop error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching crop"
        });
    }
};
// ========================================
// UPDATE CROP
// PUT /api/crops/:id
// ========================================
const updateCrop = async (req, res) => {
    try {
        const {
            name,
            plantingDate,
            expectedHarvestDate,
            status
        } = req.body;

        // Find the crop
        const crop = await Crop.findById(req.params.id)
            .populate("farm");

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found"
            });
        }

        // Check that the farm belongs to the logged-in user
        if (crop.farm.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this crop"
            });
        }

        // Update only provided fields
        if (name) {
            crop.name = name.trim();
        }

        if (plantingDate) {
            crop.plantingDate = plantingDate;
        }

        if (expectedHarvestDate) {
            crop.expectedHarvestDate = expectedHarvestDate;
        }

        if (status) {
            crop.status = status;
        }

        const updatedCrop = await crop.save();

        return res.status(200).json({
            success: true,
            message: "Crop updated successfully",
            crop: updatedCrop
        });

    } catch (error) {
        console.error("Update crop error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating crop"
        });
    }
};
// ========================================
// DELETE CROP
// DELETE /api/crops/:id
// ========================================
const deleteCrop = async (req, res) => {
    try {
        // Find the crop and populate its farm
        const crop = await Crop.findById(req.params.id)
            .populate("farm");

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found"
            });
        }

        // Check that the farm belongs to the logged-in user
        if (crop.farm.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this crop"
            });
        }

        // Delete the crop
        await crop.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Crop deleted successfully"
        });

    } catch (error) {
        console.error("Delete crop error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting crop"
        });
    }
};
module.exports = {
    createCrop,
    getMyCrops,
    getCropById,
    updateCrop,
    deleteCrop
};