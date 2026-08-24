const getWeather = async (req, res) => {
    try {
        const { location } = req.query;

        // Default location
        const selectedLocation = location || "Colombo";

        const API_KEY = process.env.WEATHER_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Weather API key is missing"
            });
        }

        const url =
            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(selectedLocation)}&days=5&aqi=no&alerts=yes`;

        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message:
                    data.error?.message ||
                    "Failed to fetch weather data"
            });
        }

        const weather = {
            success: true,

            location: {
                name: data.location.name,
                region: data.location.region,
                country: data.location.country,
                latitude: data.location.lat,
                longitude: data.location.lon,
                localtime: data.location.localtime
            },

            current: {
                temperature: data.current.temp_c,
                feelsLike: data.current.feelslike_c,
                humidity: data.current.humidity,
                windSpeed: data.current.wind_kph,
                rainfall: data.current.precip_mm,
                uv: data.current.uv,

                condition: data.current.condition.text,

                icon: data.current.condition.icon,

                lastUpdated: data.current.last_updated
            },

            forecast: data.forecast.forecastday.map(function (day) {
                return {
                    date: day.date,

                    maxTemperature:
                        day.day.maxtemp_c,

                    minTemperature:
                        day.day.mintemp_c,

                    averageTemperature:
                        day.day.avgtemp_c,

                    condition:
                        day.day.condition.text,

                    icon:
                        day.day.condition.icon,

                    rainChance:
                        day.day.daily_chance_of_rain,

                    totalRain:
                        day.day.totalprecip_mm,

                    humidity:
                        day.day.avghumidity,

                    maxWind:
                        day.day.maxwind_kph
                };
            }),

            alerts: data.alerts?.alert || []
        };

        res.status(200).json(weather);

    } catch (error) {

        console.error(
            "Weather API error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch weather data"
        });

    }
};


module.exports = {
    getWeather
};