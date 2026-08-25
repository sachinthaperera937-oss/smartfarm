const API_URL = "https://smartfarm-hpam.onrender.com/api";

// ========================================
// AUTHENTICATION
// ========================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ========================================
// API ENDPOINTS
// ========================================

const RECOMMENDATIONS_ENDPOINT =
    `${API_URL}/recommendations`;

const FARMS_ENDPOINT =
    `${API_URL}/farms`;


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
// DOM ELEMENTS
// ========================================

const farmSelect =
    document.getElementById("farmSelect");

const cropTypeInput =
    document.getElementById("cropType");

const soilTypeInput =
    document.getElementById("soilType");

const growthStageInput =
    document.getElementById("growthStage");

const lastIrrigationInput =
    document.getElementById(
        "lastIrrigationDate"
    );

const generateBtn =
    document.getElementById("generateBtn");

const resultContainer =
    document.getElementById(
        "recommendationResult"
    );


// ========================================
// STORE FARMS
// ========================================

let farmsData = [];


// ========================================
// GET HEADERS
// ========================================

function getHeaders() {

    const headers = {
        "Content-Type":
            "application/json"
    };

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }

    return headers;

}


// ========================================
// MATCH FARM LOCATION
// ========================================

function matchLocation(locationText) {

    if (!locationText) {
        return null;
    }

    const searchLocation =
        locationText
            .toLowerCase()
            .trim();

    return Object.values(locations).find(
        function(location) {

            const fullName =
                location.name
                    .toLowerCase();

            const cityName =
                location.name
                    .split(",")[0]
                    .toLowerCase();

            return (
                fullName.includes(
                    searchLocation
                ) ||

                searchLocation.includes(
                    fullName
                ) ||

                searchLocation.includes(
                    cityName
                )
            );

        }
    ) || null;

}


// ========================================
// LOAD FARMS
// ========================================

async function loadFarms() {

    if (!farmSelect) {
        return;
    }

    try {

        farmSelect.innerHTML = `
            <option value="">
                Loading farms...
            </option>
        `;

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

        farmsData =
            data.farms || [];


        if (farmsData.length === 0) {

            farmSelect.innerHTML = `
                <option value="">
                    No farms found
                </option>
            `;

            return;

        }


        farmSelect.innerHTML = `
            <option value="">
                Select a farm
            </option>
        `;


        farmsData.forEach(
            function(farm) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    farm._id;

                option.textContent =
                    `${farm.name} (${farm.location || "Unknown location"})`;

                farmSelect.appendChild(
                    option
                );

            }
        );


        // Select first farm automatically

        farmSelect.value =
            farmsData[0]._id;


        prefillFromFarm(
            farmsData[0]
        );

    } catch (error) {

        console.error(
            "Failed to load farms:",
            error
        );

        farmSelect.innerHTML = `
            <option value="">
                Unable to load farms
            </option>
        `;

    }

}


// ========================================
// PREFILL FARM INFORMATION
// ========================================

function prefillFromFarm(farm) {

    if (!farm) {
        return;
    }

    if (cropTypeInput) {

        cropTypeInput.value =
            farm.cropType || "";

    }

    if (
        soilTypeInput &&
        farm.soilType
    ) {

        soilTypeInput.value =
            farm.soilType;

    }

}


// ========================================
// FARM CHANGE EVENT
// ========================================

if (farmSelect) {

    farmSelect.addEventListener(
        "change",
        function() {

            const farm =
                farmsData.find(
                    function(item) {

                        return (
                            item._id ===
                            farmSelect.value
                        );

                    }
                );

            prefillFromFarm(
                farm
            );

        }
    );

}


// ========================================
// GENERATE RECOMMENDATION
// ========================================

async function generateRecommendation() {

    if (!farmSelect) {
        return;
    }

    const farmId =
        farmSelect.value;

    const farm =
        farmsData.find(
            function(item) {

                return (
                    item._id === farmId
                );

            }
        );


    if (!farm) {

        resultContainer.innerHTML = `
            <p class="loading-message">
                Please select a farm.
            </p>
        `;

        return;

    }


    /*
    =====================================
    USE FARM COORDINATES FIRST
    =====================================
    */

    let latitude =
        farm.latitude;

    let longitude =
        farm.longitude;


    /*
    =====================================
    FALLBACK TO FIXED LOCATIONS
    =====================================
    */

    if (
        latitude === undefined ||
        latitude === null ||
        longitude === undefined ||
        longitude === null
    ) {

        const matchedLocation =
            matchLocation(
                farm.location
            );

        if (matchedLocation) {

            latitude =
                matchedLocation.latitude;

            longitude =
                matchedLocation.longitude;

        }

    }


    /*
    =====================================
    CHECK LOCATION
    =====================================
    */

    if (
        latitude === undefined ||
        latitude === null ||
        longitude === undefined ||
        longitude === null ||
        latitude === "" ||
        longitude === ""
    ) {

        resultContainer.innerHTML = `
            <p class="loading-message">
                This farm does not have valid coordinates.
                Please edit the farm and add latitude and longitude.
            </p>
        `;

        return;

    }


    resultContainer.innerHTML = `
        <p class="loading-message">
            Generating AI insights...
        </p>
    `;


    if (generateBtn) {

        generateBtn.disabled =
            true;

        generateBtn.textContent =
            "Generating...";

    }


    try {

        const response =
            await fetch(
                `${RECOMMENDATIONS_ENDPOINT}/${farmId}`,
                {

                    method: "POST",

                    headers:
                        getHeaders(),

                    body:
                        JSON.stringify({

                            latitude:
                                Number(latitude),

                            longitude:
                                Number(longitude),

                            cropType:
                                cropTypeInput
                                    ? (
                                        cropTypeInput.value ||
                                        farm.cropType ||
                                        ""
                                    )
                                    : (
                                        farm.cropType ||
                                        ""
                                    ),

                            soilType:
                                soilTypeInput
                                    ? soilTypeInput.value
                                    : "",

                            growthStage:
                                growthStageInput
                                    ? growthStageInput.value
                                    : "",

                            lastIrrigationDate:
                                lastIrrigationInput
                                    ? lastIrrigationInput.value
                                    : ""

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to generate recommendation"
            );

        }


        renderRecommendation(
            data
        );

    } catch (error) {

        console.error(
            "Recommendation error:",
            error
        );

        resultContainer.innerHTML = `
            <p class="loading-message">
                Unable to generate recommendation.
                ${error.message}
            </p>
        `;

    } finally {

        if (generateBtn) {

            generateBtn.disabled =
                false;

            generateBtn.textContent =
                "Generate Recommendations";

        }

    }

}


// ========================================
// RENDER RECOMMENDATION
// ========================================

function renderRecommendation(rec) {

    const irrigation =
        rec.irrigation || {};

    const cropHealthRisk =
        rec.cropHealthRisk || {};

    const pestRisk =
        rec.pestRisk || {};

    const generalRecommendations =
        Array.isArray(
            rec.generalRecommendations
        )
            ? rec.generalRecommendations
            : [];

    const weatherAlerts =
        Array.isArray(
            rec.weatherAlerts
        )
            ? rec.weatherAlerts
            : [];


    const irrigationUrgency =
        irrigation.urgency ||
        "normal";


    const cropRiskLevel =
        cropHealthRisk.riskLevel ||
        "low";


    const pestRiskLevel =
        pestRisk.riskLevel ||
        "low";


    const cropRisks =
        Array.isArray(
            cropHealthRisk.risks
        )
            ? cropHealthRisk.risks
            : [];


    const likelyPests =
        Array.isArray(
            pestRisk.likelyPests
        )
            ? pestRisk.likelyPests
            : [];


    resultContainer.innerHTML = `

        <div class="rec-card urgency-${irrigationUrgency}">

            <h3>
                💧 Irrigation
            </h3>

            <p>
                <strong>
                    ${irrigationUrgency.toUpperCase()} urgency
                </strong>
            </p>

            <p>
                ${irrigation.recommendation || "No irrigation recommendation available."}
            </p>

            <small>
                ${irrigation.reasoning || ""}
            </small>

        </div>


        <div class="rec-card risk-${cropRiskLevel}">

            <h3>
                🌱 Crop Health Risk
            </h3>

            <p>
                <strong>
                    ${cropRiskLevel.toUpperCase()}
                </strong>
            </p>

            <ul>
                ${
                    cropRisks.length > 0
                        ? cropRisks
                            .map(
                                risk =>
                                    `<li>${risk}</li>`
                            )
                            .join("")
                        : "<li>No major crop health risks detected.</li>"
                }
            </ul>

            <small>
                ${cropHealthRisk.reasoning || ""}
            </small>

        </div>


        <div class="rec-card risk-${pestRiskLevel}">

            <h3>
                🐛 Pest Risk
            </h3>

            <p>
                <strong>
                    ${pestRiskLevel.toUpperCase()}
                </strong>
            </p>

            <ul>
                ${
                    likelyPests.length > 0
                        ? likelyPests
                            .map(
                                pest =>
                                    `<li>${pest}</li>`
                            )
                            .join("")
                        : "<li>No major pest risks detected.</li>"
                }
            </ul>

            <small>
                ${pestRisk.reasoning || ""}
            </small>

        </div>


        <div class="rec-card">

            <h3>
                📋 General Recommendations
            </h3>

            <ul>
                ${
                    generalRecommendations.length > 0
                        ? generalRecommendations
                            .map(
                                recommendation =>
                                    `<li>${recommendation}</li>`
                            )
                            .join("")
                        : "<li>Continue monitoring your farm conditions regularly.</li>"
                }
            </ul>

        </div>


        ${
            weatherAlerts.length > 0
                ? `

                <div class="rec-card alert">

                    <h3>
                        ⚠️ Weather Alerts
                    </h3>

                    <ul>
                        ${
                            weatherAlerts
                                .map(
                                    alert =>
                                        `<li>${alert}</li>`
                                )
                                .join("")
                        }
                    </ul>

                </div>

                `
                : ""
        }

    `;

}


// ========================================
// GENERATE BUTTON EVENT
// ========================================

if (generateBtn) {

    generateBtn.addEventListener(
        "click",
        generateRecommendation
    );

}


// ========================================
// INITIALIZE
// ========================================

loadFarms();