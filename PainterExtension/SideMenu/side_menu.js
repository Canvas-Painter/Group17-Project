// features/side_menu.js

// This feature only requires a js file since it is sufficient enough to not have a css or html for this function.

export function initializeSideMenu() {
    console.log("Canvas Side Menu Feature Loaded");

    // Wait for the page to fully load before injecting the menu
    document.addEventListener("DOMContentLoaded", () => {
        createSideMenu();
    });
}

function createSideMenu() {
    let sideMenu = document.createElement("div");
    sideMenu.id = "canvas-enhancer-side-menu";
    sideMenu.style.position = "fixed";
    sideMenu.style.top = "50px";
    sideMenu.style.right = "0px";
    sideMenu.style.width = "250px";
    sideMenu.style.height = "100%";
    sideMenu.style.background = "#f4f4f4";
    sideMenu.style.borderLeft = "1px solid #ccc";
    sideMenu.style.padding = "10px";
    sideMenu.style.overflowY = "auto";
    sideMenu.style.boxShadow = "-2px 0px 5px rgba(0, 0, 0, 0.2)";

    sideMenu.innerHTML = `
        <h3>Canvas Enhancer</h3>
        <button id="toggle-syllabus">Toggle Syllabus</button>
        <button id="toggle-ta-hours">TA Hours</button>
        <button id="toggle-grades">Grade Overview</button>
        <button id="toggle-theme">Toggle Theme</button>
    `;

    document.body.appendChild(sideMenu);

    // Event listeners for buttons
    document.getElementById("toggle-syllabus").addEventListener("click", () => {
        console.log("Syllabus button clicked");
    });

    document.getElementById("toggle-ta-hours").addEventListener("click", () => {
        console.log("TA Hours button clicked");
    });

    document.getElementById("toggle-grades").addEventListener("click", () => {
        console.log("Grade Overview button clicked");
    });

    document.getElementById("toggle-theme").addEventListener("click", () => {
        console.log("Theme Toggle button clicked");
    });
}
