const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        farm: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Farm",
            required: true
        },

        crop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Crop",
            default: null
        },

        dueDate: {
            type: Date,
            required: true
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },

        status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", taskSchema);