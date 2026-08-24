const Task = require("../models/Task");
const Farm = require("../models/Farm");
const Crop = require("../models/Crop");


// ========================================
// CREATE TASK
// POST /api/tasks
// ========================================
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            farm,
            crop,
            dueDate,
            priority,
            status
        } = req.body;

        // Validate required fields
        if (!title || !farm || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide title, farm and dueDate"
            });
        }

        // Check if farm exists and belongs to logged-in user
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

        // Check crop if provided
        if (crop) {
            const existingCrop = await Crop.findOne({
                _id: crop,
                farm: farm
            });

            if (!existingCrop) {
                return res.status(404).json({
                    success: false,
                    message: "Crop not found or does not belong to this farm"
                });
            }
        }

        // Create task
        const task = await Task.create({
            title: title.trim(),
            description: description ? description.trim() : "",
            farm,
            crop: crop || null,
            dueDate,
            priority: priority || "medium",
            status: status || "pending"
        });

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            task
        });

    } catch (error) {
        console.error("Create task error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating task"
        });
    }
};


// ========================================
// GET ALL TASKS FOR LOGGED-IN USER
// GET /api/tasks
// ========================================
const getMyTasks = async (req, res) => {
    try {
        // Find all farms owned by logged-in user
        const farms = await Farm.find({
            owner: req.user.id
        });

        const farmIds = farms.map((farm) => farm._id);

        // Find tasks belonging to those farms
        const tasks = await Task.find({
            farm: { $in: farmIds }
        })
            .populate("farm", "name location")
            .populate("crop", "name")
            .sort({ dueDate: 1 });

        return res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });

    } catch (error) {
        console.error("Get tasks error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching tasks"
        });
    }
};


// ========================================
// GET SINGLE TASK
// GET /api/tasks/:id
// ========================================
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate("farm", "name location owner")
            .populate("crop", "name");

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Make sure the farm still exists and belongs to user
        const existingFarm = await Farm.findOne({
            _id: task.farm._id,
            owner: req.user.id
        });

        if (!existingFarm) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this task"
            });
        }

        return res.status(200).json({
            success: true,
            task
        });

    } catch (error) {
        console.error("Get task error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching task"
        });
    }
};


// ========================================
// UPDATE TASK
// PUT /api/tasks/:id
// ========================================
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Check task ownership
        const existingFarm = await Farm.findOne({
            _id: task.farm,
            owner: req.user.id
        });

        if (!existingFarm) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this task"
            });
        }

        const {
            title,
            description,
            farm,
            crop,
            dueDate,
            priority,
            status
        } = req.body;

        // Change farm if provided
        if (farm !== undefined) {
            const newFarm = await Farm.findOne({
                _id: farm,
                owner: req.user.id
            });

            if (!newFarm) {
                return res.status(404).json({
                    success: false,
                    message: "Farm not found or you do not have access to it"
                });
            }

            task.farm = farm;
        }

        // Change crop if provided
        if (crop !== undefined) {
            // Allow crop to be removed
            if (crop === null || crop === "") {
                task.crop = null;
            } else {
                const selectedFarm = farm || task.farm;

                const existingCrop = await Crop.findOne({
                    _id: crop,
                    farm: selectedFarm
                });

                if (!existingCrop) {
                    return res.status(404).json({
                        success: false,
                        message: "Crop not found or does not belong to this farm"
                    });
                }

                task.crop = crop;
            }
        }

        // Update title
        if (title !== undefined) {
            task.title = title.trim();
        }

        // Update description
        if (description !== undefined) {
            task.description = description.trim();
        }

        // Update due date
        if (dueDate !== undefined) {
            task.dueDate = dueDate;
        }

        // Update priority
        if (priority !== undefined) {
            task.priority = priority;
        }

        // Update status
        if (status !== undefined) {
            task.status = status;
        }

        await task.save();

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        console.error("Update task error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating task"
        });
    }
};


// ========================================
// DELETE TASK
// DELETE /api/tasks/:id
// ========================================
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Check ownership
        const existingFarm = await Farm.findOne({
            _id: task.farm,
            owner: req.user.id
        });

        if (!existingFarm) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this task"
            });
        }

        await task.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error("Delete task error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting task"
        });
    }
};


// ========================================
// EXPORT CONTROLLERS
// ========================================
module.exports = {
    createTask,
    getMyTasks,
    getTaskById,
    updateTask,
    deleteTask
};