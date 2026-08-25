const API_URL = "https://smartfarm-hpam.onrender.com/api";

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

const farmsGrid = document.getElementById("farmsGrid");
const totalFarmsElement = document.getElementById("totalFarms");
const totalAreaElement = document.getElementById("totalArea");

const farmModal = document.getElementById("farmModal");
const addFarmButton = document.getElementById("addFarmButton");
const closeModalButton = document.getElementById("closeModal");
const cancelModalButton = document.getElementById("cancelModal");

const farmForm = document.getElementById("farmForm");
const farmSearch = document.getElementById("farmSearch");

const modalTitle = document.getElementById("modalTitle");
const saveFarmButton = document.getElementById("saveFarmButton");

const useCurrentLocationBtn = document.getElementById(
    "useCurrentLocationBtn"
);


// ========================================
// LOAD USER INFORMATION
// ========================================

const loadUser = () => {
    const userData = localStorage.getItem("user");

    if (!userData) return;

    const user = JSON.parse(userData);
    const userName = user.name || "Farmer";

    const userNameElement = document.getElementById("userName");
    const userAvatarElement = document.getElementById("userAvatar");

    if (userNameElement) {
        userNameElement.textContent = userName;
    }

    if (userAvatarElement) {
        userAvatarElement.textContent =
            userName.charAt(0).toUpperCase();
    }
};


// ========================================
// LOAD FARMS
// ========================================

let allFarms = [];

const loadFarms = async () => {
    try {
        farmsGrid.innerHTML = `
            <p class="loading-message">
                Loading farms...
            </p>
        `;

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

        allFarms = data.farms || [];

        updateFarmSummary();
        displayFarms(allFarms);

    } catch (error) {
        console.error("Load farms error:", error);

        farmsGrid.innerHTML = `
            <p class="loading-message">
                Failed to load farms.
            </p>
        `;
    }
};


// ========================================
// UPDATE FARM SUMMARY
// ========================================

const updateFarmSummary = () => {
    if (totalFarmsElement) {
        totalFarmsElement.textContent =
            allFarms.length;
    }

    const totalArea = allFarms.reduce(
        (total, farm) => {
            return total + Number(farm.size || 0);
        },
        0
    );

    if (totalAreaElement) {
        totalAreaElement.textContent =
            `${totalArea} acres`;
    }
};


// ========================================
// DISPLAY FARMS
// ========================================

const displayFarms = (farms) => {

    farmsGrid.innerHTML = "";

    if (farms.length === 0) {

        farmsGrid.innerHTML = `
            <p class="loading-message">
                No farms found. Click "Add New Farm"
                to create your first farm.
            </p>
        `;

        return;
    }

    farms.forEach((farm) => {

        const farmCard =
            document.createElement("article");

        farmCard.className = "farm-card";

        farmCard.innerHTML = `

            <div class="farm-card-top">

                <div class="farm-image">
                    🌱
                </div>

                <button
                    class="more-button"
                    onclick="editFarm('${farm._id}')"
                    title="Edit Farm"
                >
                    ✏️
                </button>

            </div>


            <div class="farm-card-content">

                <div class="farm-title">

                    <div>

                        <h3>
                            ${farm.name || "Unnamed Farm"}
                        </h3>

                        <p>
                            📍 ${farm.location || "Location not specified"}
                        </p>

                    </div>

                    <span class="status healthy">
                        Active
                    </span>

                </div>


                <div class="farm-details">

                    <div>

                        <span>
                            Area
                        </span>

                        <strong>
                            ${farm.size || 0} acres
                        </strong>

                    </div>


                    <div>

                        <span>
                            Soil Type
                        </span>

                        <strong>
                            ${farm.soilType || "Not specified"}
                        </strong>

                    </div>

                </div>


                <div class="farm-crop">

                    <div class="crop-symbol">
                        🌾
                    </div>

                    <div>

                        <span>
                            Primary Crop
                        </span>

                        <strong>
                            ${farm.cropType || "Not specified"}
                        </strong>

                    </div>

                </div>


                <div style="display: flex; gap: 10px;">

                    <button
                        class="view-farm"
                        onclick="editFarm('${farm._id}')"
                    >
                        Edit
                    </button>


                    <button
                        class="view-farm"
                        onclick="deleteFarm('${farm._id}')"
                    >
                        Delete
                    </button>

                </div>

            </div>
        `;

        farmsGrid.appendChild(farmCard);
    });
};


// ========================================
// OPEN ADD FARM MODAL
// ========================================

const openAddFarmModal = () => {

    farmForm.reset();

    document.getElementById("farmId").value = "";

    modalTitle.textContent = "Add New Farm";

    saveFarmButton.textContent = "Save Farm";

    farmModal.classList.add("show");
};


if (addFarmButton) {
    addFarmButton.addEventListener(
        "click",
        openAddFarmModal
    );
}


// ========================================
// USE CURRENT LOCATION
// ========================================

if (useCurrentLocationBtn) {

    useCurrentLocationBtn.addEventListener(
        "click",
        () => {

            if (!navigator.geolocation) {

                alert(
                    "Geolocation is not supported by your browser. Please enter coordinates manually."
                );

                return;
            }

            useCurrentLocationBtn.textContent =
                "Detecting location...";

            useCurrentLocationBtn.disabled = true;


            navigator.geolocation.getCurrentPosition(

                (position) => {

                    document.getElementById(
                        "farmLatitude"
                    ).value =
                        position.coords.latitude.toFixed(4);


                    document.getElementById(
                        "farmLongitude"
                    ).value =
                        position.coords.longitude.toFixed(4);


                    useCurrentLocationBtn.textContent =
                        "📍 Use My Current Location";

                    useCurrentLocationBtn.disabled = false;

                },

                (error) => {

                    console.error(
                        "Geolocation error:",
                        error
                    );

                    alert(
                        "Unable to detect location. Please enter coordinates manually."
                    );

                    useCurrentLocationBtn.textContent =
                        "📍 Use My Current Location";

                    useCurrentLocationBtn.disabled = false;

                }

            );

        }
    );
}


// ========================================
// CLOSE MODAL
// ========================================

const closeFarmModal = () => {

    farmModal.classList.remove("show");

    farmForm.reset();

    document.getElementById("farmId").value = "";
};


if (closeModalButton) {
    closeModalButton.addEventListener(
        "click",
        closeFarmModal
    );
}

if (cancelModalButton) {
    cancelModalButton.addEventListener(
        "click",
        closeFarmModal
    );
}


// ========================================
// CREATE OR UPDATE FARM
// ========================================

if (farmForm) {

    farmForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const farmId =
                document.getElementById("farmId").value;

            const name =
                document.getElementById("farmName")
                    .value
                    .trim();

            const location =
                document.getElementById("farmLocation")
                    .value
                    .trim();

            const latitude =
                document.getElementById("farmLatitude").value;

            const longitude =
                document.getElementById("farmLongitude").value;

            const size =
                Number(
                    document.getElementById("farmArea").value
                );

            const soilType =
                document.getElementById("soilType").value;

            const cropType =
                document.getElementById("primaryCrop").value;


            if (!name || !location || !size || !cropType) {

                alert(
                    "Please fill in all required farm information."
                );

                return;
            }


            if (
                latitude === "" ||
                longitude === ""
            ) {

                alert(
                    "Please provide latitude and longitude, or use 'Use My Current Location'."
                );

                return;
            }


            const farmData = {

                name,

                location,

                latitude: Number(latitude),

                longitude: Number(longitude),

                size,

                soilType,

                cropType

            };


            try {

                saveFarmButton.disabled = true;

                saveFarmButton.textContent =
                    farmId
                        ? "Updating..."
                        : "Saving...";


                const url =
                    farmId
                        ? `${API_URL}/farms/${farmId}`
                        : `${API_URL}/farms`;


                const method =
                    farmId
                        ? "PUT"
                        : "POST";


                const response = await fetch(
                    url,
                    {

                        method,

                        headers: {

                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(farmData)

                    }
                );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to save farm"
                    );

                }


                alert(
                    farmId
                        ? "Farm updated successfully!"
                        : "Farm created successfully!"
                );


                closeFarmModal();

                await loadFarms();


            } catch (error) {

                console.error(
                    "Save farm error:",
                    error
                );

                alert(
                    error.message ||
                    "Failed to save farm."
                );

            } finally {

                saveFarmButton.disabled = false;

                saveFarmButton.textContent =
                    farmId
                        ? "Update Farm"
                        : "Save Farm";

            }

        }
    );
}


// ========================================
// EDIT FARM
// ========================================

const editFarm = (farmId) => {

    const farm =
        allFarms.find(
            (item) => item._id === farmId
        );


    if (!farm) {

        alert("Farm not found");

        return;
    }


    document.getElementById("farmId").value =
        farm._id;

    document.getElementById("farmName").value =
        farm.name || "";

    document.getElementById("farmLocation").value =
        farm.location || "";

    document.getElementById("farmLatitude").value =
        farm.latitude ?? "";

    document.getElementById("farmLongitude").value =
        farm.longitude ?? "";

    document.getElementById("farmArea").value =
        farm.size || "";

    document.getElementById("soilType").value =
        farm.soilType || "";

    document.getElementById("primaryCrop").value =
        farm.cropType || "";


    modalTitle.textContent = "Edit Farm";

    saveFarmButton.textContent = "Update Farm";

    farmModal.classList.add("show");
};


window.editFarm = editFarm;


// ========================================
// DELETE FARM
// ========================================

const deleteFarm = async (farmId) => {

    const confirmDelete = confirm(
        "Are you sure you want to delete this farm?"
    );

    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/farms/${farmId}`,
            {

                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }

            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete farm"
            );

        }


        alert("Farm deleted successfully!");

        await loadFarms();


    } catch (error) {

        console.error(
            "Delete farm error:",
            error
        );

        alert(
            error.message ||
            "Failed to delete farm."
        );

    }

};


window.deleteFarm = deleteFarm;


// ========================================
// SEARCH FARMS
// ========================================

if (farmSearch) {

    farmSearch.addEventListener(
        "input",
        () => {

            const searchText =
                farmSearch.value
                    .toLowerCase()
                    .trim();


            const filteredFarms =
                allFarms.filter(
                    (farm) => {

                        const name =
                            (farm.name || "")
                                .toLowerCase();

                        const location =
                            (farm.location || "")
                                .toLowerCase();


                        return (
                            name.includes(searchText) ||
                            location.includes(searchText)
                        );

                    }
                );


            displayFarms(filteredFarms);

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
        (event) => {

            event.preventDefault();

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "login.html";

        }
    );

}


// ========================================
// START APPLICATION
// ========================================

loadUser();

loadFarms();