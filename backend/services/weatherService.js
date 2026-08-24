const axios = require('axios');

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetch current weather for given coordinates (Open-Meteo — no API key required)
 */
async function getCurrentWeather(latitude, longitude) {
  const { data } = await axios.get(BASE_URL, {
    params: {
      latitude,
      longitude,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weathercode,wind_speed_10m,uv_index',
      timezone: 'auto'
    }
  });

  const c = data.current;

  return {
    time: c.time,
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    precipitation: c.precipitation,
    weatherCode: c.weathercode,
    uvIndex: c.uv_index ?? null
  };
}

/**
 * Fetch 5-day daily forecast for given coordinates
 */
async function getForecast(latitude, longitude, days = 5) {
  const { data } = await axios.get(BASE_URL, {
    params: {
      latitude,
      longitude,
      daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: days
    }
  });

  const d = data.daily;

  return d.time.map((date, i) => ({
    date,
    temperature: d.temperature_2m_max[i],
    temperatureMin: d.temperature_2m_min[i],
    weatherCode: d.weathercode[i],
    precipitationProbability: d.precipitation_probability_max[i]
  }));
}

module.exports = { getCurrentWeather, getForecast };