const Farm = require("../models/Farm");

// ========================================
// CREATE FARM
// POST /api/farms
// ========================================
const createFarm = async (req, res) => {
    try {
        const { name, location, latitude, longitude, size, cropType } = req.body;

        // Validate required fields
        if (!name || !location || !size || !cropType || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, location, latitude, longitude, size and cropType"
            });
        }

        const lat = Number(latitude);
        const lng = Number(longitude);

        if (isNaN(lat) || lat < -90 || lat > 90) {
            return res.status(400).json({
                success: false,
                message: "Latitude must be a number between -90 and 90"
            });
        }

        if (isNaN(lng) || lng < -180 || lng > 180) {
            return res.status(400).json({
                success: false,
                message: "Longitude must be a number between -180 and 180"
            });
        }

        // Create farm
        const farm = await Farm.create({
            name: name.trim(),
            location: location.trim(),
            latitude: lat,
            longitude: lng,
            size,
            cropType: cropType.trim(),
            owner: req.user.id
        });

        return res.status(201).json({
            success: true,
            message: "Farm created successfully",
            farm
        });

    } catch (error) {
        console.error("Create farm error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating farm"
        });
    }
};


// ========================================
// GET ALL FARMS FOR LOGGED-IN USER
// GET /api/farms
// ========================================
const getMyFarms = async (req, res) => {
    try {
        const farms = await Farm.find({
            owner: req.user.id
        });

        return res.status(200).json({
            success: true,
            count: farms.length,
            farms
        });

    } catch (error) {
        console.error("Get farms error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching farms"
        });
    }
};


// ========================================
// GET SINGLE FARM BY ID
// GET /api/farms/:id
// ========================================
const getFarmById = async (req, res) => {
    try {
        const farm = await Farm.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found"
            });
        }

        return res.status(200).json({
            success: true,
            farm
        });

    } catch (error) {
        console.error("Get farm error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching farm"
        });
    }
};

// ========================================
// UPDATE FARM
// PUT /api/farms/:id
// ========================================
const updateFarm = async (req, res) => {
    try {
        const { name, location, latitude, longitude, size, cropType } = req.body;

        const farm = await Farm.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found"
            });
        }

        if (name) {
            farm.name = name.trim();
        }

        if (location) {
            farm.location = location.trim();
        }

        if (latitude !== undefined) {
            const lat = Number(latitude);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                return res.status(400).json({
                    success: false,
                    message: "Latitude must be a number between -90 and 90"
                });
            }
            farm.latitude = lat;
        }

        if (longitude !== undefined) {
            const lng = Number(longitude);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                return res.status(400).json({
                    success: false,
                    message: "Longitude must be a number between -180 and 180"
                });
            }
            farm.longitude = lng;
        }

        if (size !== undefined) {
            farm.size = size;
        }

        if (cropType) {
            farm.cropType = cropType.trim();
        }

        const updatedFarm = await farm.save();

        return res.status(200).json({
            success: true,
            message: "Farm updated successfully",
            farm: updatedFarm
        });

    } catch (error) {
        console.error("Update farm error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating farm"
        });
    }
};

// ========================================
// DELETE FARM
// DELETE /api/farms/:id
// ========================================
const deleteFarm = async (req, res) => {
    try {
        const farm = await Farm.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found"
            });
        }

        await farm.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Farm deleted successfully"
        });

    } catch (error) {
        console.error("Delete farm error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting farm"
        });
    }
};

module.exports = {
    createFarm,
    getMyFarms,
    getFarmById,
    updateFarm,
    deleteFarm
};