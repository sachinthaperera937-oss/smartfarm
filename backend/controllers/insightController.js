const { getCurrentWeather, getForecast } = require("../services/weatherService");

const risk = (title, level, text, action) => ({ title, level, text, action });

exports.generateInsights = async (req, res) => {
  const latitude = Number(req.body.latitude || 6.9271);
  const longitude = Number(req.body.longitude || 79.8612);
  const crop = req.body.crop || "Tomatoes";
  const soilMoisture = Number(req.body.soilMoisture ?? 42);
  const humidity = Number(req.body.humidity ?? 76);

  try {
    const [weather, forecast] = await Promise.all([getCurrentWeather(latitude, longitude), getForecast(latitude, longitude, 5)]);
    const rainChance = Math.max(...forecast.map(day => day.precipitationProbability || 0));
    const insights = [];
    if (soilMoisture < 40) insights.push(risk("Irrigation check recommended", "high", `Soil moisture is ${soilMoisture}%, below the preferred range for ${crop}.`, "Inspect irrigation zones and water early morning."));
    if (humidity >= 75) insights.push(risk("Fungal disease risk is elevated", "medium", `Humidity is ${humidity}%, creating favourable leaf-wetness conditions for ${crop}.`, "Improve airflow and inspect lower leaves before the next irrigation cycle."));
    if (rainChance >= 55) insights.push(risk("Rain window can reduce water use", "low", `${rainChance}% rain probability is forecast within the next five days.`, "Pause non-essential irrigation and reassess after rainfall."));
    if (!insights.length) insights.push(risk("Growing conditions are stable", "low", "Current soil and weather readings are within a healthy operational range.", "Continue the planned scouting and irrigation schedule."));
    insights.push(risk("Monitor crop heat stress", weather.temperature >= 32 ? "medium" : "low", `Current temperature is ${weather.temperature}°C with a feels-like temperature of ${weather.feelsLike}°C.`, "Schedule field work and irrigation outside the hottest hours."));
    res.json({ success: true, generatedAt: new Date().toISOString(), model: "SmartFarm agronomy rules engine", inputs: { crop, soilMoisture, humidity }, insights, weatherSummary: { temperature: weather.temperature, condition: weather.weatherCode, rainChance } });
  } catch (error) {
    console.error("Insight generation error:", error.message);
    res.status(502).json({ success: false, message: "Insights need live weather data. Please retry shortly." });
  }
};
