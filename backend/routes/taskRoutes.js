const express = require("express");

const router = express.Router();

// Authentication middleware
const protect = require("../middleware/authMiddleware");

// Task controller functions
const {
    createTask,
    getMyTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require("../controllers/taskController");


// ========================================
// GET ALL TASKS FOR LOGGED-IN USER
// GET /api/tasks
// ========================================
router.get("/", protect, getMyTasks);


// ========================================
// CREATE TASK
// POST /api/tasks
// ========================================
router.post("/", protect, createTask);


// ========================================
// GET SINGLE TASK
// GET /api/tasks/:id
// ========================================
router.get("/:id", protect, getTaskById);


// ========================================
// UPDATE TASK
// PUT /api/tasks/:id
// ========================================
router.put("/:id", protect, updateTask);


// ========================================
// DELETE TASK
// DELETE /api/tasks/:id
// ========================================
router.delete("/:id", protect, deleteTask);


// EXPORT ROUTER
module.exports = router;