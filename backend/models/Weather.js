const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  location: String,
  current: {
    tempC: Number,
    humidity: Number,
    condition: String,
    windKph: Number,
    precipMm: Number,
    uv: Number
  },
  forecast: [{
    date: String,
    maxTempC: Number,
    minTempC: Number,
    avgHumidity: Number,
    chanceOfRain: Number,
    totalPrecipMm: Number,
    condition: String
  }],
  alerts: [mongoose.Schema.Types.Mixed],
  fetchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Weather', weatherSchema);