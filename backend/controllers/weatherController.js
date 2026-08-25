const { getCurrentWeather, getForecast } = require("../services/weatherService");

const weatherText = code => ({ 0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 51: "Light drizzle", 53: "Drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 80: "Rain showers", 81: "Rain showers", 95: "Thunderstorm" }[code] || "Variable conditions");

exports.getWeather = async (req, res) => {
  const latitude = Number(req.query.latitude || 6.9271);
  const longitude = Number(req.query.longitude || 79.8612);
  const location = req.query.location || "Colombo, Sri Lanka";
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return res.status(400).json({ success: false, message: "Valid latitude and longitude are required." });

  try {
    const [current, forecast] = await Promise.all([getCurrentWeather(latitude, longitude), getForecast(latitude, longitude, 5)]);
    res.json({
      success: true,
      source: "Open-Meteo",
      location: { name: location, latitude, longitude },
      current: { ...current, condition: weatherText(current.weatherCode) },
      forecast: forecast.map(day => ({ ...day, condition: weatherText(day.weatherCode) }))
    });
  } catch (error) {
    console.error("Weather service error:", error.message);
    res.status(502).json({ success: false, message: "Weather data is temporarily unavailable. Please retry shortly." });
  }
};
