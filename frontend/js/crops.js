const API_URL = "http://localhost:5000/api";

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

    return new Date(date).toLocaleDateString();
}


// ========================================
// LOAD FARMS INTO DROPDOWN
// ========================================

async function loadFarms() {

    try {

        const response = await fetch(
            `${API_URL}/farms`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load farms"
            );
        }

        const cropFarm =
            document.getElementById("cropFarm");

        cropFarm.innerHTML = `
            <option value="">
                Select farm
            </option>
        `;

        (data.farms || []).forEach(function(farm) {

            const option =
                document.createElement("option");

            option.value = farm._id;

            option.textContent = farm.name;

            cropFarm.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Load farms error:",
            error
        );

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

        const response = await fetch(
            `${API_URL}/crops`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

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

        console.error(
            "Load crops error:",
            error
        );

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


    if (crops.length === 0) {

        cropGrid.innerHTML = `
            <p class="loading-message">
                No crops found. Add your first crop.
            </p>
        `;

        return;

    }


    crops.forEach(function(crop) {

        addCropCard(crop);

    });

}


// ========================================
// ADD CROP CARD
// ========================================

function addCropCard(crop) {

    const card =
        document.createElement("article");

    card.className = "crop-card";

    card.dataset.stage =
        crop.stage || "";


    const icon =
        getCropIcon(crop.name);


    const progress =
        getGrowthProgress(crop.stage);


    const farmName =
        crop.farm && crop.farm.name
            ? crop.farm.name
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

                    <h3>
                        ${crop.name}
                    </h3>

                    <p>
                        ${farmName}
                    </p>

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

    totalCrops.textContent =
        allCrops.length;

}


// ========================================
// OPEN MODAL
// ========================================

addCropButton.addEventListener(
    "click",
    function() {

        cropForm.reset();

        cropModal.classList.add("show");

    }
);


// ========================================
// CLOSE MODAL
// ========================================

function closeCropModal() {

    cropModal.classList.remove("show");

    cropForm.reset();

}


closeModal.addEventListener(
    "click",
    closeCropModal
);


cancelModal.addEventListener(
    "click",
    closeCropModal
);


cropModal.addEventListener(
    "click",
    function(event) {

        if (event.target === cropModal) {

            closeCropModal();

        }

    }
);


// ========================================
// CREATE CROP
// ========================================

cropForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const cropName =
            document
                .getElementById("cropName")
                .value
                .trim();


        const farm =
            document
                .getElementById("cropFarm")
                .value;


        const plantingDate =
            document
                .getElementById("plantingDate")
                .value;


        const expectedHarvestDate =
            document
                .getElementById("harvestDate")
                .value;


        const stage =
            document
                .getElementById("growthStage")
                .value;


        const cropData = {

            name: cropName,

            farm: farm,

            plantingDate: plantingDate,

            expectedHarvestDate: expectedHarvestDate,

            stage: stage

        };


        try {

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


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to create crop"
                );

            }


            alert(
                "Crop added successfully!"
            );


            closeCropModal();


            await loadCrops();

        } catch (error) {

            console.error(
                "Create crop error:",
                error
            );

            alert(
                error.message
            );

        }

    }
);


// ========================================
// DELETE CROP
// ========================================

async function deleteCrop(cropId) {

    const confirmed =
        confirm(
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
                    "Authorization":
                        `Bearer ${token}`
                }

            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete crop"
            );

        }


        alert(
            "Crop deleted successfully!"
        );


        await loadCrops();

    } catch (error) {

        console.error(
            "Delete crop error:",
            error
        );

        alert(
            error.message
        );

    }

}


// ========================================
// MAKE DELETE FUNCTION GLOBAL
// ========================================

window.deleteCrop = deleteCrop;


// ========================================
// FILTER CROPS
// ========================================

function filterCrops() {

    const search =
        cropSearch.value
            .toLowerCase()
            .trim();


    const stage =
        stageFilter.value;


    const filteredCrops =
        allCrops.filter(function(crop) {

            const cropName =
                (crop.name || "")
                    .toLowerCase();


            const farmName =
                crop.farm && crop.farm.name
                    ? crop.farm.name
                        .toLowerCase()
                    : "";


            const cropStage =
                crop.stage || "";


            const matchesSearch =

                cropName.includes(search) ||

                farmName.includes(search);


            const matchesStage =

                stage === "all" ||

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

cropSearch.addEventListener(
    "input",
    filterCrops
);


// ========================================
// FILTER EVENT
// ========================================

stageFilter.addEventListener(
    "change",
    filterCrops
);


// ========================================
// INITIALIZE PAGE
// ========================================

loadFarms();

loadCrops();