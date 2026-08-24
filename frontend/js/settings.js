const tabs = document.querySelectorAll(".settings-tab");
const sections = document.querySelectorAll(".settings-section");
const toast = document.getElementById("toast");


/* SWITCH SETTINGS TABS */

tabs.forEach(function(tab) {

    tab.addEventListener("click", function() {

        const sectionName =
            tab.dataset.section;


        tabs.forEach(function(item) {
            item.classList.remove("active");
        });


        sections.forEach(function(section) {
            section.classList.remove("active");
        });


        tab.classList.add("active");

        document
            .getElementById(sectionName)
            .classList.add("active");

    });

});


/* TOAST */

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(function() {

        toast.classList.remove("show");

    }, 2500);

}


/* PROFILE */

document
    .getElementById("profileForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        showToast(
            "Profile changes saved successfully."
        );

    });


/* CANCEL */

document
    .querySelector(".cancel-button")
    .addEventListener("click", function() {

        showToast("Changes cancelled.");

    });


/* PREFERENCES */

document
    .getElementById("savePreferences")
    .addEventListener("click", function() {

        showToast(
            "Preferences saved successfully."
        );

    });


/* PASSWORD */

document
    .getElementById("passwordForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        if (!newPassword || !confirmPassword) {

            showToast(
                "Please enter your new password."
            );

            return;

        }


        if (newPassword !== confirmPassword) {

            showToast(
                "Passwords do not match."
            );

            return;

        }


        showToast(
            "Password updated successfully."
        );

        this.reset();

    });


/* DELETE ACCOUNT */

document
    .querySelector(".delete-button")
    .addEventListener("click", function() {

        const confirmed =
            confirm(
                "Are you sure you want to delete your account?"
            );

        if (confirmed) {

            showToast(
                "Account deletion will be handled by the backend."
            );

        }

    });