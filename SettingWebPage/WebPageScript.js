document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("settings-form");
    
    // Load saved settings from local storage
    function loadSettings() {
        const setting1 = localStorage.getItem("setting1") || "";
        const setting2 = localStorage.getItem("setting2") === "true";
        
        document.getElementById("setting1").value = setting1;
        document.getElementById("setting2").checked = setting2;
    }
    
    // Save settings to local storage
    function saveSettings(event) {
        event.preventDefault();
        
        const setting1 = document.getElementById("setting1").value;
        const setting2 = document.getElementById("setting2").checked;
        
        localStorage.setItem("setting1", setting1);
        localStorage.setItem("setting2", setting2);
        
        alert("Settings saved successfully!");
    }
    
    form.addEventListener("submit", saveSettings);
    loadSettings();
});
