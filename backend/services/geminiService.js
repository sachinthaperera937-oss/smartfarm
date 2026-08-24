const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function weatherCodeToText(code) {
  const map = {
    0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
    80: 'Rain showers', 81: 'Rain showers', 82: 'Violent rain showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Severe thunderstorm'
  };
  return map[code] || 'Unknown';
}

async function generateFarmInsights(currentWeather, forecast, farmData) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json', temperature: 0.4 }
  });

  const prompt = `
You are an agricultural advisor AI for a smart farm system. Return ONLY valid JSON,
no markdown, matching exactly this schema:

{
  "irrigation": {
    "recommendation": string,
    "urgency": "low" | "medium" | "high",
    "reasoning": string
  },
  "cropHealthRisk": {
    "riskLevel": "low" | "medium" | "high",
    "risks": [string],
    "reasoning": string
  },
  "pestRisk": {
    "riskLevel": "low" | "medium" | "high",
    "likelyPests": [string],
    "reasoning": string
  },
  "generalRecommendations": [string],
  "weatherAlerts": [string]
}

FARM DATA:
- Crop: ${farmData.cropType}
- Soil type: ${farmData.soilType}
- Growth stage: ${farmData.growthStage}
- Farm size: ${farmData.farmSizeAcres} acres
- Last irrigation: ${farmData.lastIrrigationDate}

CURRENT WEATHER:
- Condition: ${weatherCodeToText(currentWeather.weatherCode)}
- Temperature: ${currentWeather.temperature}°C (feels like ${currentWeather.feelsLike}°C)
- Humidity: ${currentWeather.humidity}%
- Wind: ${currentWeather.windSpeed} km/h
- Precipitation: ${currentWeather.precipitation} mm
- UV Index: ${currentWeather.uvIndex ?? 'N/A'}

5-DAY FORECAST:
${forecast.map(d => `${d.date}: ${weatherCodeToText(d.weatherCode)}, high ${d.temperature}°C / low ${d.temperatureMin}°C, ${d.precipitationProbability}% rain chance`).join('\n')}
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

module.exports = { generateFarmInsights };