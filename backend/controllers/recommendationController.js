const Farm = require('../models/Farm');
const Recommendation = require('../models/Recommendation');
const { getCurrentWeather, getForecast } = require('../services/weatherService');
const { generateFarmInsights } = require('../services/geminiService');

// POST /api/recommendations/:farmId
// body: { latitude, longitude, cropType, soilType, growthStage, lastIrrigationDate, cropId }
exports.generateRecommendation = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.farmId);
    if (!farm) return res.status(404).json({ message: 'Farm not found' });

    const { latitude, longitude, cropType, soilType, growthStage, lastIrrigationDate, cropId } = req.body;

    if (!latitude || !longitude || !cropType) {
      return res.status(400).json({ message: 'latitude, longitude and cropType are required' });
    }

    const [currentWeather, forecast] = await Promise.all([
      getCurrentWeather(latitude, longitude),
      getForecast(latitude, longitude, 5)
    ]);

    const farmData = {
      cropType,
      soilType,
      growthStage,
      farmSizeAcres: farm.sizeAcres,
      lastIrrigationDate
    };

    const insights = await generateFarmInsights(currentWeather, forecast, farmData);

    const saved = await Recommendation.create({
      farm: farm._id,
      crop: cropId || undefined,
      ...insights
    });

    res.json(saved);
  } catch (err) {
    console.error('Recommendation generation error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate recommendation' });
  }
};

// GET /api/recommendations/:farmId
exports.getRecommendations = async (req, res) => {
  try {
    const recs = await Recommendation.find({ farm: req.params.farmId }).sort({ createdAt: -1 });
    res.json({ recommendations: recs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
};