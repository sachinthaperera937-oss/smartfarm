const API_URL = "https://smartfarm-hpam.onrender.com/api";

// ========================================
// AUTHENTICATION
// ========================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ========================================
// GET AUTH HEADERS
// ========================================

function getHeaders() {
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
}


// ========================================
// HANDLE API ERRORS
// ========================================

function handleUnauthorized(response) {
    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        alert("Your session has expired. Please log in again.");

        window.location.href = "login.html";

        return true;
    }

    return false;
}


// ========================================
// LOAD DASHBOARD DATA
// ========================================

const loadDashboard = async () => {
    try {
        const response = await fetch(
            `${API_URL}/dashboard`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        if (handleUnauthorized(response)) {
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load dashboard"
            );
        }

        const totalFarmsElement =
            document.getElementById("totalFarms");

        const totalCropsElement =
            document.getElementById("totalCrops");

        if (totalFarmsElement) {
            totalFarmsElement.textContent =
                data.dashboard?.totalFarms ?? 0;
        }

        if (totalCropsElement) {
            totalCropsElement.textContent =
                data.dashboard?.totalCrops ?? 0;
        }

    } catch (error) {
        console.error("Dashboard error:", error);
    }
};


// ========================================
// LOAD FARMS
// ========================================

const loadFarms = async () => {
    const farmList =
        document.getElementById("farmList");

    if (!farmList) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/farms`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        if (handleUnauthorized(response)) {
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load farms"
            );
        }

        // Check if there are no farms
        if (!data.farms || data.farms.length === 0) {
            farmList.innerHTML = `
                <p>No farms found. Create your first farm.</p>
            `;
            return;
        }

        // Clear loading message
        farmList.innerHTML = "";

        // Show maximum of 3 farms
        const farms = data.farms.slice(0, 3);

        farms.forEach((farm) => {
            const farmRow = document.createElement("div");

            farmRow.className = "farm-row";

            farmRow.innerHTML = `
                <div class="farm-info">

                    <div class="farm-avatar">
                        🌱
                    </div>

                    <div>
                        <strong>${farm.name || "Unnamed Farm"}</strong>

                        <span>
                            ${farm.location || "Location not specified"}
                            •
                            ${farm.size || 0} acres
                        </span>
                    </div>

                </div>

                <div class="crop-info">
                    <span>Farm</span>
                    <strong>Active</strong>
                </div>

                <div>
                    <span class="status healthy">
                        Active
                    </span>
                </div>
            `;

            farmList.appendChild(farmRow);
        });

    } catch (error) {
        console.error("Farm loading error:", error);

        farmList.innerHTML = `
            <p>Failed to load farms. Please try again.</p>
        `;
    }
};


// ========================================
// LOAD USER INFORMATION
// ========================================

const loadUser = () => {
    const userData = localStorage.getItem("user");

    if (!userData) {
        return;
    }

    try {
        const user = JSON.parse(userData);

        const userName =
            user.name || "Farmer";

        const userNameElement =
            document.querySelector(".user strong");

        const welcomeElement =
            document.querySelector(".welcome h2");

        const avatarElement =
            document.querySelector(".avatar");

        if (userNameElement) {
            userNameElement.textContent = userName;
        }

        if (welcomeElement) {
            welcomeElement.textContent =
                `Welcome back, ${userName} 👋`;
        }

        if (avatarElement) {
            avatarElement.textContent =
                userName.charAt(0).toUpperCase();
        }

    } catch (error) {
        console.error(
            "Failed to load user information:",
            error
        );
    }
};


// ========================================
// START APPLICATION
// ========================================

loadUser();
loadDashboard();
loadFarms();