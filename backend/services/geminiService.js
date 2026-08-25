const { GoogleGenerativeAI } = require("@google/generative-ai");


// ========================================
// GEMINI API CONFIGURATION
// ========================================

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error(
        "GEMINI_API_KEY is missing. Please add it to your environment variables."
    );
}

const genAI = new GoogleGenerativeAI(apiKey);


// ========================================
// WEATHER CODE TO TEXT
// ========================================

function weatherCodeToText(code) {

    const map = {

        0: "Clear sky",

        1: "Mostly clear",

        2: "Partly cloudy",

        3: "Overcast",

        45: "Fog",

        48: "Depositing fog",

        51: "Light drizzle",

        53: "Moderate drizzle",

        55: "Dense drizzle",

        61: "Light rain",

        63: "Moderate rain",

        65: "Heavy rain",

        71: "Light snow",

        73: "Moderate snow",

        75: "Heavy snow",

        80: "Light rain showers",

        81: "Moderate rain showers",

        82: "Violent rain showers",

        95: "Thunderstorm",

        96: "Thunderstorm with hail",

        99: "Severe thunderstorm"

    };


    return map[code] || "Unknown weather condition";

}


// ========================================
// CLEAN GEMINI RESPONSE
// ========================================

function cleanJsonResponse(text) {

    if (!text) {
        throw new Error(
            "Gemini returned an empty response"
        );
    }


    let cleaned = text.trim();


    // Remove ```json if Gemini includes it
    if (cleaned.startsWith("```json")) {

        cleaned = cleaned
            .replace(/^```json/i, "")
            .replace(/```$/i, "")
            .trim();

    }


    // Remove normal ``` blocks
    if (cleaned.startsWith("```")) {

        cleaned = cleaned
            .replace(/^```/i, "")
            .replace(/```$/i, "")
            .trim();

    }


    return cleaned;

}


// ========================================
// GENERATE FARM INSIGHTS
// ========================================

async function generateFarmInsights(
    currentWeather,
    forecast,
    farmData
) {

    try {

        // Check API key

        if (!process.env.GEMINI_API_KEY) {

            throw new Error(
                "GEMINI_API_KEY is not configured"
            );

        }


        // ========================================
        // GEMINI MODEL
        // ========================================

        const model =
            genAI.getGenerativeModel({

                model: "gemini-2.0-flash",

                generationConfig: {

                    temperature: 0.4,

                    responseMimeType:
                        "application/json"

                }

            });


        // ========================================
        // SAFELY HANDLE WEATHER DATA
        // ========================================

        const weatherCode =
            currentWeather.weatherCode ??
            currentWeather.weathercode ??
            null;


        const temperature =
            currentWeather.temperature ??
            "N/A";


        const feelsLike =
            currentWeather.feelsLike ??
            currentWeather.apparentTemperature ??
            "N/A";


        const humidity =
            currentWeather.humidity ??
            currentWeather.relativeHumidity ??
            "N/A";


        const windSpeed =
            currentWeather.windSpeed ??
            currentWeather.windspeed ??
            "N/A";


        const precipitation =
            currentWeather.precipitation ??
            currentWeather.rainfall ??
            0;


        const uvIndex =
            currentWeather.uvIndex ??
            currentWeather.uv ??
            "N/A";


        // ========================================
        // FORMAT FORECAST
        // ========================================

        const forecastText =
            Array.isArray(forecast)
                ? forecast.map((day) => {

                    const date =
                        day.date ||
                        "Unknown date";


                    const code =
                        day.weatherCode ??
                        day.weathercode ??
                        null;


                    const maxTemperature =
                        day.temperature ??
                        day.maxTemperature ??
                        "N/A";


                    const minTemperature =
                        day.temperatureMin ??
                        day.minTemperature ??
                        "N/A";


                    const rainChance =
                        day.precipitationProbability ??
                        day.rainChance ??
                        0;


                    return `${date}:
Condition: ${weatherCodeToText(code)}
Maximum temperature: ${maxTemperature}°C
Minimum temperature: ${minTemperature}°C
Rain chance: ${rainChance}%`;

                }).join("\n\n")
                : "Forecast unavailable";


        // ========================================
        // AI PROMPT
        // ========================================

        const prompt = `
You are an agricultural advisor for a SmartFarm application.

Analyze the farm data, current weather, and weather forecast.

Return ONLY valid JSON.

Do not include markdown.
Do not include explanations outside the JSON.
Do not wrap the response in \`\`\`json.

The response MUST match exactly this structure:

{
  "irrigation": {
    "recommendation": "string",
    "urgency": "low",
    "reasoning": "string"
  },
  "cropHealthRisk": {
    "riskLevel": "low",
    "risks": ["string"],
    "reasoning": "string"
  },
  "pestRisk": {
    "riskLevel": "low",
    "likelyPests": ["string"],
    "reasoning": "string"
  },
  "generalRecommendations": [
    "string"
  ],
  "weatherAlerts": [
    "string"
  ]
}

IMPORTANT:

- urgency must only be: low, medium, or high.
- cropHealthRisk.riskLevel must only be: low, medium, or high.
- pestRisk.riskLevel must only be: low, medium, or high.
- Give practical recommendations suitable for farmers.
- Consider rainfall before recommending irrigation.
- Consider humidity when assessing fungal disease risk.
- Consider temperature and humidity when assessing pest risk.

========================================
FARM DATA
========================================

Crop:
${farmData.cropType || "Not specified"}

Soil type:
${farmData.soilType || "Not specified"}

Growth stage:
${farmData.growthStage || "Not specified"}

Farm size:
${farmData.farmSizeAcres || 0} acres

Last irrigation:
${farmData.lastIrrigationDate || "Not specified"}

Location:
${farmData.location || "Not specified"}

========================================
CURRENT WEATHER
========================================

Condition:
${weatherCodeToText(weatherCode)}

Temperature:
${temperature}°C

Feels like:
${feelsLike}°C

Humidity:
${humidity}%

Wind speed:
${windSpeed} km/h

Precipitation:
${precipitation} mm

UV Index:
${uvIndex}

========================================
5-DAY WEATHER FORECAST
========================================

${forecastText}
`;


        // ========================================
        // GENERATE GEMINI RESPONSE
        // ========================================

        console.log(
            "Generating AI farm insights..."
        );


        const result =
            await model.generateContent(
                prompt
            );


        const response =
            await result.response;


        const text =
            response.text();


        console.log(
            "Gemini response received successfully"
        );


        // ========================================
        // CLEAN RESPONSE
        // ========================================

        const cleanedResponse =
            cleanJsonResponse(
                text
            );


        // ========================================
        // PARSE JSON
        // ========================================

        let insights;


        try {

            insights =
                JSON.parse(
                    cleanedResponse
                );

        } catch (parseError) {

            console.error(
                "Failed to parse Gemini JSON:",
                cleanedResponse
            );


            throw new Error(
                "Gemini returned invalid JSON"
            );

        }


        // ========================================
        // VALIDATE RESPONSE
        // ========================================

        if (
            !insights.irrigation ||
            !insights.cropHealthRisk ||
            !insights.pestRisk ||
            !Array.isArray(
                insights.generalRecommendations
            ) ||
            !Array.isArray(
                insights.weatherAlerts
            )
        ) {

            throw new Error(
                "Gemini returned an incomplete response"
            );

        }


        // Normalize values

        const validLevels =
            ["low", "medium", "high"];


        if (
            !validLevels.includes(
                insights.irrigation.urgency
            )
        ) {

            insights.irrigation.urgency =
                "medium";

        }


        if (
            !validLevels.includes(
                insights.cropHealthRisk.riskLevel
            )
        ) {

            insights.cropHealthRisk.riskLevel =
                "medium";

        }


        if (
            !validLevels.includes(
                insights.pestRisk.riskLevel
            )
        ) {

            insights.pestRisk.riskLevel =
                "medium";

        }


        return insights;


    } catch (error) {

        console.error(
            "Gemini AI error:",
            error.message
        );


        throw error;

    }

}


// ========================================
// EXPORT
// ========================================

module.exports = {
    generateFarmInsights
};