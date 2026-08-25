require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map(origin => origin.trim())
  : [];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  }
}));
app.use(express.json({ limit: "100kb" }));

connectDB();

// Public, deployment-ready intelligence endpoints used by the dashboard.
app.use("/api/weather", require("./routes/weatherRoutes"));
app.use("/api/insights", require("./routes/insightRoutes"));

// Existing authenticated data routes are retained for multi-user deployments.
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/farms", require("./routes/farmRoutes"));
app.use("/api/crops", require("./routes/cropRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/recommendations", require("./routes/recommendationRoutes"));

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "healthy", service: "SmartFarm API", timestamp: new Date().toISOString() });
});

app.use(express.static(path.join(__dirname, "..", "frontend")));
app.get("/{*splat}", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  return res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: "An unexpected server error occurred." });
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`SmartFarm is running at http://localhost:${PORT}`));
