document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("settings-form");

    // Function to load saved settings from local storage
    function loadSettings() {
        // Retrieve values from local storage or set defaults
        const setting1 = localStorage.getItem("setting1") || "";
        const setting2 = localStorage.getItem("setting2") === "true";

        // Set the form fields with the loaded values
        document.getElementById("setting1").value = setting1;
        document.getElementById("setting2").checked = setting2;
    }

    // Function to save settings to local storage
    function saveSettings(event) {
        event.preventDefault(); // Prevent form submission refresh

        // Get values from form fields
        const setting1 = document.getElementById("setting1").value;
        const setting2 = document.getElementById("setting2").checked;

        // Store values in local storage
        localStorage.setItem("setting1", setting1);
        localStorage.setItem("setting2", setting2);

        // Notify the user that settings have been saved
        alert("Settings saved successfully!");
    }

    // Add event listener to handle form submission
    form.addEventListener("submit", saveSettings);

    // Load settings when the page is loaded
    loadSettings();
});