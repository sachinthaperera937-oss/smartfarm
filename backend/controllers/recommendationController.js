const Farm = require("../models/Farm");
const Recommendation = require("../models/Recommendation");

const {
    getCurrentWeather,
    getForecast
} = require("../services/weatherService");

const {
    generateFarmInsights
} = require("../services/geminiService");


// ========================================
// GENERATE RECOMMENDATION
// POST /api/recommendations/:farmId
// ========================================

exports.generateRecommendation = async (req, res) => {

    try {

        // ========================================
        // FIND FARM
        // ========================================

        const farm =
            await Farm.findById(
                req.params.farmId
            );


        if (!farm) {

            return res.status(404).json({
                message: "Farm not found"
            });

        }


        // ========================================
        // GET REQUEST DATA
        // ========================================

        const {
            latitude,
            longitude,
            cropType,
            soilType,
            growthStage,
            lastIrrigationDate,
            cropId
        } = req.body;


        // ========================================
        // VALIDATION
        // ========================================

        if (
            latitude === undefined ||
            latitude === null ||
            longitude === undefined ||
            longitude === null ||
            !cropType
        ) {

            return res.status(400).json({
                message:
                    "latitude, longitude and cropType are required"
            });

        }


        // ========================================
        // GET WEATHER DATA
        // ========================================

        const [
            currentWeather,
            forecast
        ] = await Promise.all([

            getCurrentWeather(
                Number(latitude),
                Number(longitude)
            ),

            getForecast(
                Number(latitude),
                Number(longitude),
                5
            )

        ]);


        // ========================================
        // PREPARE FARM DATA FOR AI
        // ========================================

        const farmData = {

            cropType:
                cropType || farm.cropType || "",

            soilType:
                soilType ||
                farm.soilType ||
                "Not specified",

            growthStage:
                growthStage ||
                "Not specified",

            // Farm model uses "size"
            farmSizeAcres:
                farm.size || 0,

            lastIrrigationDate:
                lastIrrigationDate ||
                "Not specified",

            location:
                farm.location || "Unknown"

        };


        // ========================================
        // GENERATE AI INSIGHTS
        // ========================================

        const insights =
            await generateFarmInsights(
                currentWeather,
                forecast,
                farmData
            );


        // ========================================
        // SAVE RECOMMENDATION
        // ========================================

        const saved =
            await Recommendation.create({

                farm:
                    farm._id,

                crop:
                    cropId || undefined,

                ...insights

            });


        // ========================================
        // SUCCESS RESPONSE
        // ========================================

        return res.status(200).json(
            saved
        );


    } catch (error) {

        console.error(
            "Recommendation generation error:",
            error.response?.data ||
            error.message ||
            error
        );


        return res.status(500).json({

            message:
                "Failed to generate recommendation"

        });

    }

};


// ========================================
// GET FARM RECOMMENDATIONS
// GET /api/recommendations/:farmId
// ========================================

exports.getRecommendations = async (req, res) => {

    try {

        const farm =
            await Farm.findById(
                req.params.farmId
            );


        if (!farm) {

            return res.status(404).json({

                message:
                    "Farm not found"

            });

        }


        const recommendations =
            await Recommendation.find({

                farm:
                    req.params.farmId

            })
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            recommendations

        });


    } catch (error) {

        console.error(
            "Fetch recommendations error:",
            error.message
        );


        return res.status(500).json({

            message:
                "Failed to fetch recommendations"

        });

    }

};