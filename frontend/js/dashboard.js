const API_URL = "http://localhost:5000/api";

// Get saved token
const token = localStorage.getItem("token");

// Redirect to login if user is not logged in
if (!token) {
    window.location.href = "login.html";
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
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load dashboard"
            );
        }

        // Update statistics
        document.getElementById("totalFarms").textContent =
            data.dashboard.totalFarms;

        document.getElementById("totalCrops").textContent =
            data.dashboard.totalCrops;

    } catch (error) {
        console.error("Dashboard error:", error);
    }
};


// ========================================
// LOAD FARMS
// ========================================

const loadFarms = async () => {
    try {
        const response = await fetch(
            `${API_URL}/farms`,
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
                data.message || "Failed to load farms"
            );
        }

        const farmList =
            document.getElementById("farmList");

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
                        <strong>${farm.name}</strong>
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

        document.getElementById("farmList").innerHTML = `
            <p>Failed to load farms.</p>
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

    const user = JSON.parse(userData);

    const userName =
        user.name || "Farmer";

    // Update user name
    document.querySelector(".user strong").textContent =
        userName;

    // Update welcome message
    document.querySelector(".welcome h2").textContent =
        `Welcome back, ${userName} 👋`;

    // Update avatar
    document.querySelector(".avatar").textContent =
        userName.charAt(0).toUpperCase();
};


// ========================================
// START
// ========================================

loadUser();
loadDashboard();
loadFarms();