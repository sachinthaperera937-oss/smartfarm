const API_URL = "http://localhost:5000/api";

// ========================================
// AUTHENTICATION
// ========================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ========================================
// WEATHER LOCATIONS
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

const FARMS_ENDPOINT = `${API_URL}/farms`;


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

const farmConditionGrid =
    document.getElementById("farmConditionGrid");


// ========================================
// GET AUTH HEADERS
// ========================================

function getHeaders() {

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}


// ========================================
// WEATHER CODE → WEATHER INFORMATION
// Open-Meteo weather codes
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

function formatCurrentDate(dateString) {

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


    const date =
        new Date(dateString);


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

function getUVLabel(uvIndex) {

    const value =
        Number(uvIndex);


    if (isNaN(value)) {
        return "--";
    }


    if (value <= 2) {
        return `${value} Low`;
    }


    if (value <= 5) {
        return `${value} Moderate`;
    }


    if (value <= 7) {
        return `${value} High`;
    }


    if (value <= 10) {
        return `${value} Very High`;
    }


    return `${value} Extreme`;

}


// ========================================
// CALCULATE APPROXIMATE UV
// Fallback if backend does not provide UV
// ========================================

function calculateApproximateUV(
    temperatureValue,
    weatherCode
) {

    const code =
        Number(weatherCode);


    if (
        code === 0 ||
        code === 1
    ) {

        if (temperatureValue >= 30) {
            return 9;
        }

        return 7;

    }


    if (
        code === 2 ||
        code === 3
    ) {

        return 4;

    }


    return 2;

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
            0
        );


    const windSpeed =
        Number(
            weather.windSpeed ||
            weather.windspeed ||
            0
        );


    const temperatureValue =
        Number(
            weather.temperature ||
            0
        );


    const weatherCode =
        Number(
            weather.weatherCode
        );


    if (
        weatherCode >= 95
    ) {

        return `
            Thunderstorms are possible.
            Secure farm equipment and avoid field work
            during severe weather.
        `;

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

        return `
            Rain is expected or currently occurring.
            Consider postponing irrigation and monitor
            water drainage around your crops.
        `;

    }


    if (
        humidityValue >= 85
    ) {

        return `
            High humidity may increase the risk of fungal
            diseases. Monitor crops and ensure proper
            ventilation and drainage.
        `;

    }


    if (
        temperatureValue >= 34
    ) {

        return `
            High temperatures may cause crop stress.
            Ensure adequate irrigation and monitor plants
            for heat damage.
        `;

    }


    if (
        windSpeed >= 30
    ) {

        return `
            Strong winds are affecting the area.
            Secure young plants and farming equipment.
        `;

    }


    if (
        temperatureValue <= 20
    ) {

        return `
            Cooler temperatures may slow crop growth.
            Monitor sensitive crops and adjust irrigation
            when necessary.
        `;

    }


    return `
        Weather conditions are currently suitable for
        normal farming activities. Continue monitoring
        your crops and irrigation requirements.
    `;

}


// ========================================
// FETCH CURRENT WEATHER
// ========================================

async function loadCurrentWeather(
    locationKey
) {

    const location =
        locations[locationKey];


    if (!location) {

        console.error(
            "Invalid location:",
            locationKey
        );

        return;

    }


    try {

        locationName.textContent =
            "Loading location...";


        weatherStatus.textContent =
            "Loading weather...";


        temperature.textContent =
            "--";


        humidity.textContent =
            "--";


        wind.textContent =
            "--";


        rainfall.textContent =
            "--";


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


        const precipitationValue =
            Number(
                weather.precipitation ??
                weather.rain ??
                0
            );


        const feelsLikeValue =
            weather.feelsLike ??
            weather.apparentTemperature ??
            weather.apparent_temperature ??
            temperatureValue;


        const uvValue =
            weather.uvIndex ??
            weather.uv ??
            calculateApproximateUV(
                temperatureValue,
                weatherCode
            );


        // LOCATION

        locationName.textContent =
            location.name;


        // WEATHER ICON

        weatherIcon.textContent =
            weatherInfo.icon;


        // WEATHER STATUS

        weatherStatus.textContent =
            weatherInfo.status;


        // TEMPERATURE

        temperature.textContent =
            Math.round(
                temperatureValue
            );


        // FEELS LIKE

        feelsLike.textContent =
            `${Math.round(feelsLikeValue)}°`;


        // HUMIDITY

        humidity.textContent =
            `${Math.round(humidityValue)}%`;


        // WIND SPEED

        wind.textContent =
            `${Math.round(windValue)} km/h`;


        // RAINFALL

        rainfall.textContent =
            `${precipitationValue.toFixed(1)} mm`;


        // UV INDEX

        uv.textContent =
            getUVLabel(uvValue);


        // DATE

        currentDate.textContent =
            formatCurrentDate(
                weather.time
            );


        // LAST UPDATED

        lastUpdated.textContent =
            `Last updated ${new Date().toLocaleTimeString(
                "en-US",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )}`;


        // FARMING ALERT

        weatherAlert.textContent =
            generateWeatherAlert(weather);


    } catch (error) {

        console.error(
            "Weather loading error:",
            error
        );


        locationName.textContent =
            locations[locationKey].name;


        weatherStatus.textContent =
            "Weather unavailable";


        weatherIcon.textContent =
            "⚠️";


        lastUpdated.textContent =
            "Unable to update weather";


        weatherAlert.textContent =
            "Unable to load real-time weather data. Please check your backend server and try again.";

    }

}


// ========================================
// LOAD 5 DAY FORECAST
// ========================================

async function loadForecast(
    locationKey
) {

    const location =
        locations[locationKey];


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


        // Support Open-Meteo style daily object

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

function displayForecast(
    forecastData
) {

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
                    ${formatForecastDay(
                        date,
                        index
                    )}
                </span>

                <span class="forecast-icon">
                    ${weatherInfo.icon}
                </span>

                <strong>
                    ${Math.round(
                        temperatureValue
                    )}°
                </strong>

                <span>
                    ${weatherInfo.status}
                </span>

                <small>
                    ${Math.round(
                        rainProbability
                    )}% rain
                </small>

            `;


            forecastGrid.appendChild(
                card
            );

        }
    );

}


// ========================================
// LOAD FARMS
// ========================================

async function loadFarmConditions() {

    if (!farmConditionGrid) {
        return;
    }


    farmConditionGrid.innerHTML = `
        <p class="loading-message">
            Loading farm conditions...
        </p>
    `;


    try {

        const response =
            await fetch(

                FARMS_ENDPOINT,

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
                "Failed to load farms"
            );

        }


        const farms =
            data.farms || [];


        if (farms.length === 0) {

            farmConditionGrid.innerHTML = `
                <p class="loading-message">
                    No farms available.
                </p>
            `;

            return;

        }


        farmConditionGrid.innerHTML = "";


        for (
            const farm of farms
        ) {

            await createFarmWeatherCard(
                farm
            );

        }


    } catch (error) {

        console.error(
            "Farm conditions error:",
            error
        );


        farmConditionGrid.innerHTML = `
            <p class="loading-message">
                Unable to load farm weather conditions.
            </p>
        `;

    }

}


// ========================================
// CREATE FARM WEATHER CARD
// ========================================

async function createFarmWeatherCard(
    farm
) {

    const locationText =
        farm.location ||
        "Unknown location";


    const matchedLocation =
        Object.values(locations).find(
            function(location) {

                return location.name
                    .toLowerCase()
                    .includes(
                        locationText
                            .toLowerCase()
                    );

            }
        );


    // If no matching location,
    // show a basic card

    if (!matchedLocation) {

        appendFarmCard(
            farm,
            null,
            null
        );

        return;

    }


    try {

        const response =
            await fetch(

                `${WEATHER_ENDPOINT}?latitude=${matchedLocation.latitude}&longitude=${matchedLocation.longitude}`,

                {
                    headers: getHeaders()
                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                "Weather unavailable"
            );

        }


        appendFarmCard(
            farm,
            data.weather || data,
            matchedLocation
        );


    } catch (error) {

        console.error(
            "Farm weather error:",
            error
        );


        appendFarmCard(
            farm,
            null,
            matchedLocation
        );

    }

}


// ========================================
// APPEND FARM WEATHER CARD
// ========================================

function appendFarmCard(
    farm,
    weather,
    location
) {

    const card =
        document.createElement("div");


    card.className =
        "condition-card";


    let temperatureValue = "--";

    let humidityValue = "--";

    let rainRisk = "--";

    let condition = "Monitor";

    let conditionClass =
        "condition-warning";


    if (weather) {

        temperatureValue =
            `${Math.round(
                weather.temperature || 0
            )}°C`;


        humidityValue =
            `${Math.round(
                weather.humidity || 0
            )}%`;


        const precipitation =
            Number(
                weather.precipitation ||
                weather.rain ||
                0
            );


        const weatherCode =
            Number(
                weather.weatherCode || 0
            );


        if (
            precipitation >= 5 ||
            weatherCode >= 61
        ) {

            rainRisk =
                "High";

            condition =
                "Monitor";

        } else {

            rainRisk =
                "Low";

            condition =
                "Good";

            conditionClass =
                "condition-good";

        }

    }


    card.innerHTML = `

        <div class="condition-top">

            <div>

                <h3>
                    ${farm.name || "Unnamed Farm"}
                </h3>

                <span>
                    ${farm.location || "Unknown location"}
                </span>

            </div>

            <span class="${conditionClass}">
                ${condition}
            </span>

        </div>


        <div class="condition-details">

            <div>

                <span>
                    Temperature
                </span>

                <strong>
                    ${temperatureValue}
                </strong>

            </div>


            <div>

                <span>
                    Humidity
                </span>

                <strong>
                    ${humidityValue}
                </strong>

            </div>


            <div>

                <span>
                    Rain Risk
                </span>

                <strong>
                    ${rainRisk}
                </strong>

            </div>

        </div>

    `;


    farmConditionGrid.appendChild(
        card
    );

}


// ========================================
// LOCATION CHANGE
// ========================================

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


// ========================================
// LOGOUT
// ========================================

const logoutButton =
    document.querySelector(
        'a[href="login.html"]'
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function() {

            localStorage.removeItem(
                "token"
            );

        }
    );

}


// ========================================
// INITIALIZE WEATHER PAGE
// ========================================

async function initializeWeatherPage() {

    const selectedLocation =
        locationSelect.value ||
        "colombo";


    // Load current weather

    await loadCurrentWeather(
        selectedLocation
    );


    // Load 5-day forecast

    loadForecast(
        selectedLocation
    );


    // Load weather conditions
    // for all registered farms

    loadFarmConditions();

}


// ========================================
// START APPLICATION
// ========================================

initializeWeatherPage();