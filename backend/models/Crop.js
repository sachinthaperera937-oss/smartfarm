const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        farm: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Farm",
            required: true
        },

        plantingDate: {
            type: Date,
            required: true
        },

        expectedHarvestDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: [
                "planned",
                "planted",
                "growing",
                "harvested"
            ],
            default: "planned"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Crop", cropSchema);