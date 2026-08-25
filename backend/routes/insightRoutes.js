const router = require("express").Router();
const { generateInsights } = require("../controllers/insightController");
router.post("/generate", generateInsights);
module.exports = router;
