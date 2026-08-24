const Farm = require("../models/Farm");
const Crop = require("../models/Crop");
const Task = require("../models/Task");

// ========================================
// GET DASHBOARD DATA
// GET /api/dashboard
// ========================================
const getDashboard = async (req, res) => {
    try {
        // Get all farms owned by logged-in user
        const farms = await Farm.find({
            owner: req.user.id
        });

        const farmIds = farms.map((farm) => farm._id);

        // Count crops belonging to user's farms
        const totalCrops = await Crop.countDocuments({
            farm: { $in: farmIds }
        });

        // Count all tasks belonging to user's farms
        const totalTasks = await Task.countDocuments({
            farm: { $in: farmIds }
        });

        // Count pending tasks
        const pendingTasks = await Task.countDocuments({
            farm: { $in: farmIds },
            status: "pending"
        });

        // Count completed tasks
        const completedTasks = await Task.countDocuments({
            farm: { $in: farmIds },
            status: "completed"
        });

        // Get upcoming tasks
        const upcomingTasks = await Task.find({
            farm: { $in: farmIds },
            dueDate: { $gte: new Date() },
            status: { $ne: "completed" }
        })
            .populate("farm", "name")
            .populate("crop", "name cropType")
            .sort({ dueDate: 1 })
            .limit(5);

        return res.status(200).json({
            success: true,
            dashboard: {
                totalFarms: farms.length,
                totalCrops,
                totalTasks,
                pendingTasks,
                completedTasks,
                upcomingTasks
            }
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching dashboard data"
        });
    }
};

module.exports = {
    getDashboard
};