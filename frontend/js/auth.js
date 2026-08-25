const API_URL = "https://smartfarm-hpam.onrender.com/api";

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const loginButton = loginForm.querySelector(".login-button");

        try {
            loginButton.disabled = true;
            loginButton.textContent = "Signing in...";

            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            if (!data.token) {
                throw new Error(
                    "Login succeeded, but no authentication token was received."
                );
            }

            // Remove any old authentication data
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Save fresh JWT token
            localStorage.setItem("token", data.token);

            // Save logged-in user information
            localStorage.setItem(
                "user",
                JSON.stringify(data.user || {})
            );

            alert("Login successful!");

            window.location.href = "dashboard.html";

        } catch (error) {
            console.error("Login error:", error);

            alert(
                error.message ||
                "Unable to connect to the SmartFarm server."
            );

        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "Sign In";
        }
    });
}


// ========================================
// DEMO BUTTON
// ========================================

const demoButton = document.getElementById("demoButton");

if (demoButton) {
    demoButton.addEventListener("click", () => {
        alert("Please log in using a registered account.");
    });
}