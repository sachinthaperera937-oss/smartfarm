const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "/api";

// ========================================
// AUTHENTICATION
// ========================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

// ========================================
// DOM ELEMENTS
// ========================================

const addCropButton = document.getElementById("addCropButton");
const cropModal = document.getElementById("cropModal");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");
const cropForm = document.getElementById("cropForm");

const cropSearch = document.getElementById("cropSearch");
const stageFilter = document.getElementById("stageFilter");
const cropGrid = document.getElementById("cropGrid");

const totalCrops = document.getElementById("totalCrops");

// ========================================
// STORE CROPS
// ========================================

let allCrops = [];

// ========================================
// CROP ICON
// ========================================

function getCropIcon(cropName) {
    const name = (cropName || "").toLowerCase();

    if (name.includes("tomato")) return "🍅";
    if (name.includes("rice")) return "🌾";
    if (name.includes("carrot")) return "🥕";
    if (name.includes("corn")) return "🌽";
    if (name.includes("potato")) return "🥔";

    return "🌱";
}

// ========================================
// GROWTH PROGRESS
// ========================================

function getGrowthProgress(stage) {
    if (stage === "Seedling") return 20;
    if (stage === "Vegetative") return 45;
    if (stage === "Flowering") return 65;
    if (stage === "Harvest") return 90;

    return 10;
}

// ========================================
// FORMAT DATE
// ========================================

function formatDate(date) {
    if (!date) {
        return "Not specified";
    }

    const formattedDate = new Date(date);

    if (isNaN(formattedDate.getTime())) {
        return "Not specified";
    }

    return formattedDate.toLocaleDateString();
}

// ========================================
// LOAD FARMS INTO DROPDOWN
// ========================================

async function loadFarms() {
    try {
        const response = await fetch(`${API_URL}/farms`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load farms"
            );
        }

        const cropFarm = document.getElementById("cropFarm");

        if (!cropFarm) {
            console.error("cropFarm element not found");
            return;
        }

        cropFarm.innerHTML = `
            <option value="">Select farm</option>
        `;

        (data.farms || []).forEach(function (farm) {
            const option = document.createElement("option");

            option.value = farm._id;
            option.textContent = farm.name;

            cropFarm.appendChild(option);
        });

    } catch (error) {
        console.error("Load farms error:", error);

        alert(
            error.message || "Failed to load farms"
        );
    }
}

// ========================================
// LOAD CROPS FROM BACKEND
// ========================================

async function loadCrops() {
    try {
        cropGrid.innerHTML = `
            <p class="loading-message">
                Loading crops...
            </p>
        `;

        const response = await fetch(`${API_URL}/crops`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load crops"
            );
        }

        allCrops = data.crops || [];

        displayCrops(allCrops);
        updateCropCount();

    } catch (error) {
        console.error("Load crops error:", error);

        cropGrid.innerHTML = `
            <p class="loading-message">
                Failed to load crops.
            </p>
        `;
    }
}

// ========================================
// DISPLAY CROPS
// ========================================

function displayCrops(crops) {
    cropGrid.innerHTML = "";

    if (!crops || crops.length === 0) {
        cropGrid.innerHTML = `
            <p class="loading-message">
                No crops found. Add your first crop.
            </p>
        `;

        return;
    }

    crops.forEach(function (crop) {
        addCropCard(crop);
    });
}

// ========================================
// ADD CROP CARD
// ========================================

function addCropCard(crop) {
    const card = document.createElement("article");

    card.className = "crop-card";
    card.dataset.stage = crop.stage || "";

    const icon = getCropIcon(crop.name);
    const progress = getGrowthProgress(crop.stage);

    const farmName =
        crop.farm && typeof crop.farm === "object"
            ? crop.farm.name || "Unknown Farm"
            : "Unknown Farm";

    card.innerHTML = `
        <div class="crop-card-header tomato-bg">

            <span class="crop-large-icon">
                ${icon}
            </span>

            <span class="crop-health healthy">
                Healthy
            </span>

        </div>

        <div class="crop-card-body">

            <div class="crop-title">

                <div>

                    <h3>${crop.name || "Unnamed Crop"}</h3>

                    <p>${farmName}</p>

                </div>

                <button
                    class="more-button"
                    onclick="deleteCrop('${crop._id}')"
                    title="Delete Crop"
                >
                    🗑
                </button>

            </div>

            <div class="growth-section">

                <div class="growth-header">

                    <span>
                        Growth Progress
                    </span>

                    <strong>
                        ${progress}%
                    </strong>

                </div>

                <div class="progress-bar">

                    <div
                        class="progress"
                        style="width: ${progress}%"
                    ></div>

                </div>

                <span class="stage">
                    ${crop.stage || "Not specified"}
                </span>

            </div>

            <div class="crop-info-grid">

                <div>

                    <span>
                        Planted
                    </span>

                    <strong>
                        ${formatDate(crop.plantingDate)}
                    </strong>

                </div>

                <div>

                    <span>
                        Expected Harvest
                    </span>

                    <strong>
                        ${formatDate(crop.expectedHarvestDate)}
                    </strong>

                </div>

            </div>

            <button
                class="crop-details"
                onclick="deleteCrop('${crop._id}')"
            >
                Delete Crop
            </button>

        </div>
    `;

    cropGrid.appendChild(card);
}

// ========================================
// UPDATE CROP COUNT
// ========================================

function updateCropCount() {
    if (totalCrops) {
        totalCrops.textContent = allCrops.length;
    }
}

// ========================================
// OPEN MODAL
// ========================================

if (addCropButton) {
    addCropButton.addEventListener("click", function () {
        cropForm.reset();
        cropModal.classList.add("show");
    });
}

// ========================================
// CLOSE MODAL
// ========================================

function closeCropModal() {
    if (cropModal) {
        cropModal.classList.remove("show");
    }

    if (cropForm) {
        cropForm.reset();
    }
}

if (closeModal) {
    closeModal.addEventListener(
        "click",
        closeCropModal
    );
}

if (cancelModal) {
    cancelModal.addEventListener(
        "click",
        closeCropModal
    );
}

if (cropModal) {
    cropModal.addEventListener(
        "click",
        function (event) {
            if (event.target === cropModal) {
                closeCropModal();
            }
        }
    );
}

// ========================================
// CREATE CROP
// ========================================

if (cropForm) {
    cropForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            const cropName =
                document.getElementById("cropName")
                    .value
                    .trim();

            const farm =
                document.getElementById("cropFarm")
                    .value;

            const plantingDate =
                document.getElementById("plantingDate")
                    .value;

            const expectedHarvestDate =
                document.getElementById("harvestDate")
                    .value;

            const stage =
                document.getElementById("growthStage")
                    .value;

            if (!cropName || !farm || !plantingDate || !expectedHarvestDate || !stage) {
                alert(
                    "Please complete all crop fields."
                );

                return;
            }

            const cropData = {
                name: cropName,
                farm: farm,
                plantingDate: plantingDate,
                expectedHarvestDate: expectedHarvestDate,
                status: stage
            };

            try {
                if (!token) {
                    throw new Error("Please sign in again before adding a crop.");
                }
                const response = await fetch(
                    `${API_URL}/crops`,
                    {
                        method: "POST",

                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(cropData)
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to create crop"
                    );
                }

                if (!data.crop || !data.crop._id) {
                    throw new Error("The server did not confirm that the crop was saved.");
                }
                alert("Crop added successfully!");

                closeCropModal();

                await loadCrops();

            } catch (error) {
                console.error(
                    "Create crop error:",
                    error
                );

                alert(
                    error.message ||
                    "Failed to create crop"
                );
            }
        }
    );
}

// ========================================
// DELETE CROP
// ========================================

async function deleteCrop(cropId) {
    const confirmed = confirm(
        "Are you sure you want to delete this crop?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/crops/${cropId}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to delete crop"
            );
        }

        alert("Crop deleted successfully!");

        await loadCrops();

    } catch (error) {
        console.error(
            "Delete crop error:",
            error
        );

        alert(
            error.message ||
            "Failed to delete crop"
        );
    }
}

// Make delete function available to HTML

window.deleteCrop = deleteCrop;

// ========================================
// FILTER CROPS
// ========================================

function filterCrops() {
    const search =
        cropSearch
            ? cropSearch.value.toLowerCase().trim()
            : "";

    const stage =
        stageFilter
            ? stageFilter.value
            : "all";

    const filteredCrops =
        allCrops.filter(function (crop) {

            const cropName =
                (crop.name || "")
                    .toLowerCase();

            const farmName =
                crop.farm &&
                typeof crop.farm === "object" &&
                crop.farm.name
                    ? crop.farm.name.toLowerCase()
                    : "";

            const cropStage =
                crop.stage || "";

            const matchesSearch =
                cropName.includes(search) ||
                farmName.includes(search);

            const matchesStage =
                stage === "all" ||
                stage === "" ||
                cropStage === stage;

            return (
                matchesSearch &&
                matchesStage
            );
        });

    displayCrops(filteredCrops);
}

// ========================================
// SEARCH EVENT
// ========================================

if (cropSearch) {
    cropSearch.addEventListener(
        "input",
        filterCrops
    );
}

// ========================================
// FILTER EVENT
// ========================================

if (stageFilter) {
    stageFilter.addEventListener(
        "change",
        filterCrops
    );
}

// ========================================
// INITIALIZE PAGE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {
        loadFarms();
        loadCrops();
    }
);