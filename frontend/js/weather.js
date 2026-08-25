const API_URL = "https://smartfarm-hpam.onrender.com/api";

// ========================================
// AUTHENTICATION
// ========================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ========================================
// LOCATIONS
// ========================================

const locations = {
    colombo: {
        name: "Colombo, Sri Lanka",
        latitude: 6.9271,
        longitude: 79.8612
    },

    gampaha: {
        name: "Gampaha, Sri Lanka",
        latitude: 7.084,
        longitude: 80.0098
    },

    kandy: {
        name: "Kandy, Sri Lanka",
        latitude: 7.2906,
        longitude: 80.6337
    }
};


// ========================================
// API ENDPOINTS
// ========================================

const WEATHER_ENDPOINT = `${API_URL}/weather`;
const FORECAST_ENDPOINT = `${API_URL}/weather/forecast`;


// ========================================
// DOM ELEMENTS
// ========================================

const locationSelect =
    document.getElementById("locationSelect");

const locationName =
    document.getElementById("locationName");

const weatherIcon =
    document.getElementById("weatherIcon");

const weatherStatus =
    document.getElementById("weatherStatus");

const temperature =
    document.getElementById("temperature");

const feelsLike =
    document.getElementById("feelsLike");

const currentDate =
    document.getElementById("currentDate");

const lastUpdated =
    document.getElementById("lastUpdated");

const humidity =
    document.getElementById("humidity");

const wind =
    document.getElementById("wind");

const rainfall =
    document.getElementById("rainfall");

const uv =
    document.getElementById("uv");

const forecastGrid =
    document.getElementById("forecastGrid");

const weatherAlert =
    document.getElementById("weatherAlert");


// ========================================
// GET HEADERS
// ========================================

function getHeaders() {

    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

}


// ========================================
// WEATHER CODE → INFORMATION
// Open-Meteo Weather Codes
// ========================================

function getWeatherInfo(weatherCode) {

    const code = Number(weatherCode);

    if (code === 0) {
        return {
            icon: "☀️",
            status: "Clear Sky"
        };
    }

    if (
        code === 1 ||
        code === 2
    ) {
        return {
            icon: "🌤️",
            status: "Mostly Sunny"
        };
    }

    if (code === 3) {
        return {
            icon: "☁️",
            status: "Overcast"
        };
    }

    if (
        code === 45 ||
        code === 48
    ) {
        return {
            icon: "🌫️",
            status: "Foggy"
        };
    }

    if (
        code === 51 ||
        code === 53 ||
        code === 55 ||
        code === 56 ||
        code === 57
    ) {
        return {
            icon: "🌦️",
            status: "Light Rain"
        };
    }

    if (
        code === 61 ||
        code === 63 ||
        code === 65 ||
        code === 66 ||
        code === 67
    ) {
        return {
            icon: "🌧️",
            status: "Rainy"
        };
    }

    if (
        code === 71 ||
        code === 73 ||
        code === 75 ||
        code === 77
    ) {
        return {
            icon: "❄️",
            status: "Snow"
        };
    }

    if (
        code === 80 ||
        code === 81 ||
        code === 82
    ) {
        return {
            icon: "🌦️",
            status: "Rain Showers"
        };
    }

    if (
        code === 95 ||
        code === 96 ||
        code === 99
    ) {
        return {
            icon: "⛈️",
            status: "Thunderstorm"
        };
    }

    return {
        icon: "🌤️",
        status: "Unknown"
    };

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateString) {

    if (!dateString) {

        return new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );

    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {

        return new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );

    }

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            day: "numeric",
            month: "long"
        }
    );

}


// ========================================
// FORMAT FORECAST DAY
// ========================================

function formatForecastDay(
    dateString,
    index
) {

    if (index === 0) {
        return "Today";
    }

    const date =
        new Date(dateString);

    if (isNaN(date.getTime())) {
        return `Day ${index + 1}`;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short"
        }
    );

}


// ========================================
// GET UV LABEL
// ========================================

function getUVLabel(value) {

    const uvValue =
        Number(value);

    if (isNaN(uvValue)) {
        return "--";
    }

    if (uvValue <= 2) {
        return `${uvValue} Low`;
    }

    if (uvValue <= 5) {
        return `${uvValue} Moderate`;
    }

    if (uvValue <= 7) {
        return `${uvValue} High`;
    }

    if (uvValue <= 10) {
        return `${uvValue} Very High`;
    }

    return `${uvValue} Extreme`;

}


// ========================================
// GENERATE WEATHER ALERT
// ========================================

function generateWeatherAlert(weather) {

    const rain =
        Number(
            weather.precipitation ||
            weather.rain ||
            0
        );

    const humidityValue =
        Number(
            weather.humidity ||
            weather.relativeHumidity ||
            weather.relative_humidity_2m ||
            0
        );

    const windSpeed =
        Number(
            weather.windSpeed ||
            weather.windspeed ||
            weather.wind_speed_10m ||
            0
        );

    const temperatureValue =
        Number(
            weather.temperature ||
            weather.temperature_2m ||
            0
        );

    const weatherCode =
        Number(
            weather.weatherCode ??
            weather.weathercode ??
            0
        );

    if (weatherCode >= 95) {

        return "Thunderstorms are possible. Secure farm equipment and avoid field work during severe weather.";

    }

    if (
        rain >= 5 ||
        weatherCode === 61 ||
        weatherCode === 63 ||
        weatherCode === 65 ||
        weatherCode === 80 ||
        weatherCode === 81 ||
        weatherCode === 82
    ) {

        return "Rain is expected or currently occurring. Consider postponing irrigation and monitor water drainage around your crops.";

    }

    if (humidityValue >= 85) {

        return "High humidity may increase the risk of fungal diseases. Monitor crops and ensure proper ventilation and drainage.";

    }

    if (temperatureValue >= 34) {

        return "High temperatures may cause crop stress. Ensure adequate irrigation and monitor plants for heat damage.";

    }

    if (windSpeed >= 30) {

        return "Strong winds are affecting the area. Secure young plants and farming equipment.";

    }

    return "Weather conditions are currently suitable for normal farming activities. Continue monitoring your crops and irrigation requirements.";

}


// ========================================
// LOAD CURRENT WEATHER
// ========================================

async function loadCurrentWeather(locationKey) {

    const location =
        locations[locationKey];

    if (!location) {
        return;
    }

    try {

        locationName.textContent =
            "Loading location...";

        weatherStatus.textContent =
            "Loading weather...";

        weatherIcon.textContent =
            "⏳";

        const response =
            await fetch(
                `${WEATHER_ENDPOINT}?latitude=${location.latitude}&longitude=${location.longitude}`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load weather"
            );

        }

        const weather =
            data.weather || data;

        const weatherCode =
            weather.weatherCode ??
            weather.weathercode ??
            0;

        const weatherInfo =
            getWeatherInfo(weatherCode);

        const temperatureValue =
            Number(
                weather.temperature ??
                weather.temperature_2m ??
                0
            );

        const humidityValue =
            Number(
                weather.humidity ??
                weather.relativeHumidity ??
                weather.relative_humidity_2m ??
                0
            );

        const windValue =
            Number(
                weather.windSpeed ??
                weather.windspeed ??
                weather.wind_speed_10m ??
                0
            );

        const rainfallValue =
            Number(
                weather.precipitation ??
                weather.rain ??
                0
            );

        const feelsLikeValue =
            Number(
                weather.feelsLike ??
                weather.apparentTemperature ??
                weather.apparent_temperature ??
                temperatureValue
            );

        const uvValue =
            weather.uvIndex ??
            weather.uv ??
            "--";


        locationName.textContent =
            location.name;

        weatherIcon.textContent =
            weatherInfo.icon;

        weatherStatus.textContent =
            weatherInfo.status;

        temperature.textContent =
            Math.round(temperatureValue);

        feelsLike.textContent =
            `${Math.round(feelsLikeValue)}°`;

        humidity.textContent =
            `${Math.round(humidityValue)}%`;

        wind.textContent =
            `${Math.round(windValue)} km/h`;

        rainfall.textContent =
            `${rainfallValue.toFixed(1)} mm`;

        uv.textContent =
            getUVLabel(uvValue);

        currentDate.textContent =
            formatDate(weather.time);

        lastUpdated.textContent =
            `Last updated ${new Date().toLocaleTimeString(
                "en-US",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )}`;

        weatherAlert.textContent =
            generateWeatherAlert(weather);

    } catch (error) {

        console.error(
            "Weather loading error:",
            error
        );

        locationName.textContent =
            location.name;

        weatherIcon.textContent =
            "⚠️";

        weatherStatus.textContent =
            "Weather unavailable";

        weatherAlert.textContent =
            error.message || "Unable to load weather data.";

    }

}


// ========================================
// LOAD FORECAST
// ========================================

async function loadForecast(locationKey) {

    const location =
        locations[locationKey];

    if (!location) {
        return;
    }

    forecastGrid.innerHTML = `
        <p class="loading-message">
            Loading forecast...
        </p>
    `;

    try {

        const response =
            await fetch(
                `${FORECAST_ENDPOINT}?latitude=${location.latitude}&longitude=${location.longitude}`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load forecast"
            );

        }

        let forecastData =
            data.forecast ||
            data.daily ||
            [];


        if (
            !Array.isArray(forecastData) &&
            forecastData.time
        ) {

            forecastData =
                forecastData.time.map(
                    function(date, index) {

                        return {
                            date: date,

                            temperature:
                                forecastData.temperature_2m_max
                                    ? forecastData.temperature_2m_max[index]
                                    : 0,

                            weatherCode:
                                forecastData.weathercode
                                    ? forecastData.weathercode[index]
                                    : 0,

                            precipitationProbability:
                                forecastData.precipitation_probability_max
                                    ? forecastData.precipitation_probability_max[index]
                                    : 0
                        };

                    }
                );

        }


        if (
            !Array.isArray(forecastData) ||
            forecastData.length === 0
        ) {

            throw new Error(
                "No forecast data available"
            );

        }

        displayForecast(
            forecastData.slice(0, 5)
        );

    } catch (error) {

        console.error(
            "Forecast loading error:",
            error
        );

        forecastGrid.innerHTML = `
            <p class="loading-message">
                Forecast is currently unavailable.
            </p>
        `;

    }

}


// ========================================
// DISPLAY FORECAST
// ========================================

function displayForecast(forecastData) {

    forecastGrid.innerHTML = "";

    forecastData.forEach(
        function(day, index) {

            const weatherCode =
                day.weatherCode ??
                day.weathercode ??
                0;

            const weatherInfo =
                getWeatherInfo(weatherCode);

            const temperatureValue =
                day.temperature ??
                day.temperatureMax ??
                day.temp ??
                day.temperature_2m_max ??
                0;

            const rainProbability =
                day.precipitationProbability ??
                day.rainProbability ??
                day.precipitation_probability_max ??
                0;

            const date =
                day.date ??
                day.time;

            const card =
                document.createElement("div");

            card.className =
                "forecast-card";

            card.innerHTML = `

                <span class="forecast-day">
                    ${formatForecastDay(date, index)}
                </span>

                <span class="forecast-icon">
                    ${weatherInfo.icon}
                </span>

                <strong>
                    ${Math.round(temperatureValue)}°
                </strong>

                <span>
                    ${weatherInfo.status}
                </span>

                <small>
                    ${Math.round(rainProbability)}% rain
                </small>

            `;

            forecastGrid.appendChild(card);

        }
    );

}


// ========================================
// LOCATION CHANGE
// ========================================

if (locationSelect) {

    locationSelect.addEventListener(
        "change",
        function() {

            const selectedLocation =
                locationSelect.value;

            loadCurrentWeather(
                selectedLocation
            );

            loadForecast(
                selectedLocation
            );

        }
    );

}


// ========================================
// LOGOUT
// ========================================

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
                "login.html";

        }
    );

}


// ========================================
// INITIALIZE
// ========================================

async function initializeWeatherPage() {

    const selectedLocation =
        locationSelect
            ? locationSelect.value || "colombo"
            : "colombo";

    await loadCurrentWeather(
        selectedLocation
    );

    loadForecast(
        selectedLocation
    );

}

initializeWeatherPage();