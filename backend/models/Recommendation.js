const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  irrigation: {
    recommendation: String,
    urgency: { type: String, enum: ['low', 'medium', 'high'] },
    reasoning: String
  },
  cropHealthRisk: {
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
    risks: [String],
    reasoning: String
  },
  pestRisk: {
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
    likelyPests: [String],
    reasoning: String
  },
  generalRecommendations: [String],
  weatherAlerts: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);