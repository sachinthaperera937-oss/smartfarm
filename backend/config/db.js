const mongoose = require("mongoose");

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.warn("MongoDB is not configured; starting in dashboard/demo mode.");
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.MONGO_DB_NAME || "smartfarm"
        });

        console.log(
            `MongoDB connected: ${conn.connection.host}`
        );

    } catch (error) {
        console.error(
            "MongoDB connection error:",
            error.message
        );

        console.error("Continuing without database connectivity so health and weather services remain available.");
    }
};

module.exports = connectDB;
