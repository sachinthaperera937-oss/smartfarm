const API_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const RECOMMENDATIONS_ENDPOINT = `${API_URL}/recommendations`;
const FARMS_ENDPOINT = `${API_URL}/farms`;

// Same fixed location list as weather.js — must stay in sync
const locations = {
    colombo: { name: "Colombo, Sri Lanka", latitude: 6.9271, longitude: 79.8612 },
    gampaha: { name: "Gampaha, Sri Lanka", latitude: 7.084, longitude: 80.0098 },
    kandy: { name: "Kandy, Sri Lanka", latitude: 7.2906, longitude: 80.6337 }
};

const farmSelect = document.getElementById("farmSelect");
const cropTypeInput = document.getElementById("cropType");
const soilTypeInput = document.getElementById("soilType");
const growthStageInput = document.getElementById("growthStage");
const lastIrrigationInput = document.getElementById("lastIrrigationDate");
const generateBtn = document.getElementById("generateBtn");
const resultContainer = document.getElementById("recommendationResult");

let farmsData = []; // keep full farm objects in memory so we can look up cropType/location on generate

function getHeaders() {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

// Match a farm's free-text location against the fixed coordinate list
// (same approach as appendFarmCard() in weather.js)
function matchLocation(locationText) {
    if (!locationText) return null;

    return Object.values(locations).find(loc =>
        loc.name.toLowerCase().includes(locationText.toLowerCase()) ||
        locationText.toLowerCase().includes(loc.name.split(",")[0].toLowerCase())
    ) || null;
}

async function loadFarms() {
    try {
        const res = await fetch(FARMS_ENDPOINT, { headers: getHeaders() });
        const data = await res.json();
        farmsData = data.farms || [];

        if (farmsData.length === 0) {
            farmSelect.innerHTML = `<option value="">No farms found</option>`;
            return;
        }

        farmSelect.innerHTML = farmsData.map(f =>
            `<option value="${f._id}">${f.name} (${f.location})</option>`
        ).join("");

        // Auto-fill cropType from the selected farm's stored cropType
        prefillFromFarm(farmsData[0]);
    } catch (err) {
        console.error("Failed to load farms:", err);
        farmSelect.innerHTML = `<option value="">Unable to load farms</option>`;
    }
}

function prefillFromFarm(farm) {
    if (farm && cropTypeInput) {
        cropTypeInput.value = farm.cropType || "";
    }
}

farmSelect.addEventListener("change", () => {
    const farm = farmsData.find(f => f._id === farmSelect.value);
    prefillFromFarm(farm);
});

async function generateRecommendation() {
    const farmId = farmSelect.value;
    const farm = farmsData.find(f => f._id === farmId);

    if (!farm) {
        resultContainer.innerHTML = `<p class="loading-message">Please select a farm.</p>`;
        return;
    }

    const matchedLocation = matchLocation(farm.location);

    if (!matchedLocation) {
        resultContainer.innerHTML = `
            <p class="loading-message">
                Couldn't match "${farm.location}" to a known weather location.
                Supported: Colombo, Gampaha, Kandy.
            </p>`;
        return;
    }

    resultContainer.innerHTML = `<p class="loading-message">Generating AI insights...</p>`;

    try {
        const res = await fetch(`${RECOMMENDATIONS_ENDPOINT}/${farmId}`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                latitude: matchedLocation.latitude,
                longitude: matchedLocation.longitude,
                cropType: cropTypeInput.value || farm.cropType,
                soilType: soilTypeInput.value,
                growthStage: growthStageInput.value,
                lastIrrigationDate: lastIrrigationInput.value
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to generate recommendation");
        }

        renderRecommendation(data);
    } catch (err) {
        console.error("Recommendation error:", err);
        resultContainer.innerHTML = `<p class="loading-message">Unable to generate recommendation. ${err.message}</p>`;
    }
}

function renderRecommendation(rec) {
    resultContainer.innerHTML = `
        <div class="rec-card urgency-${rec.irrigation.urgency}">
            <h3>💧 Irrigation</h3>
            <p><strong>${rec.irrigation.urgency.toUpperCase()} urgency</strong></p>
            <p>${rec.irrigation.recommendation}</p>
            <small>${rec.irrigation.reasoning}</small>
        </div>

        <div class="rec-card risk-${rec.cropHealthRisk.riskLevel}">
            <h3>🌱 Crop Health Risk</h3>
            <p><strong>${rec.cropHealthRisk.riskLevel.toUpperCase()}</strong></p>
            <ul>${rec.cropHealthRisk.risks.map(r => `<li>${r}</li>`).join("")}</ul>
            <small>${rec.cropHealthRisk.reasoning}</small>
        </div>

        <div class="rec-card risk-${rec.pestRisk.riskLevel}">
            <h3>🐛 Pest Risk</h3>
            <p><strong>${rec.pestRisk.riskLevel.toUpperCase()}</strong></p>
            <ul>${rec.pestRisk.likelyPests.map(p => `<li>${p}</li>`).join("")}</ul>
            <small>${rec.pestRisk.reasoning}</small>
        </div>

        <div class="rec-card">
            <h3>📋 General Recommendations</h3>
            <ul>${rec.generalRecommendations.map(g => `<li>${g}</li>`).join("")}</ul>
        </div>

        ${rec.weatherAlerts.length > 0 ? `
        <div class="rec-card alert">
            <h3>⚠️ Weather Alerts</h3>
            <ul>${rec.weatherAlerts.map(a => `<li>${a}</li>`).join("")}</ul>
        </div>` : ""}
    `;
}

generateBtn.addEventListener("click", generateRecommendation);

loadFarms();