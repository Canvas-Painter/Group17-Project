// features/gamified_calendar.js

export function initializeGamifiedCalendar() {
    console.log("Gamified Calendar Feature Loaded");
    
    // Wait for the page to fully load before injecting calendar enhancements
    document.addEventListener("DOMContentLoaded", () => {
        enhanceCanvasCalendar();
        displayUpcomingAssignments();
    });
}

function enhanceCanvasCalendar() {
    let calendar = document.querySelector("#calendar-container");
    if (!calendar) return;
    
    // Add gamification elements (points, streaks, badges)
    let gamificationBanner = document.createElement("div");
    gamificationBanner.id = "gamification-banner";
    gamificationBanner.style.padding = "10px";
    gamificationBanner.style.background = "#FFD700";
    gamificationBanner.style.borderRadius = "5px";
    gamificationBanner.style.marginBottom = "10px";
    gamificationBanner.innerHTML = `<strong>Gamified Calendar:</strong> Earn points for completing assignments early!`;
    
    calendar.prepend(gamificationBanner);
}

function displayUpcomingAssignments() {
    let sideMenu = document.getElementById("canvas-enhancer-side-menu");
    if (!sideMenu) return;
    
    let assignmentsContainer = document.createElement("div");
    assignmentsContainer.id = "upcoming-assignments";
    assignmentsContainer.style.marginTop = "20px";
    assignmentsContainer.innerHTML = `<h4>Upcoming Assignments</h4><ul id="assignments-list"></ul>`;
    
    sideMenu.appendChild(assignmentsContainer);
    fetchAssignments();
}

async function fetchAssignments() {
    try {
        const response = await fetch("https://canvas.instructure.com/api/v1/calendar_events?type=assignment", {
            headers: {
                "Authorization": `Bearer ${await getAccessToken()}`
            }
        });
        
        if (!response.ok) throw new Error("Failed to fetch assignments");
        
        const assignments = await response.json();
        updateAssignmentList(assignments);
    } catch (error) {
        console.error("Error fetching assignments:", error);
    }
}

function updateAssignmentList(assignments) {
    let assignmentsList = document.getElementById("assignments-list");
    assignmentsList.innerHTML = "";
    
    assignments.forEach(assignment => {
        let li = document.createElement("li");
        li.innerText = `${assignment.title} - Due: ${new Date(assignment.due_at).toLocaleDateString()}`;
        assignmentsList.appendChild(li);
    });
}

/**
 * Optional OAuth 2.0 Authentication Function
 * This function can be used to retrieve an access token for Canvas API
 */
async function getAccessToken() {
    // Placeholder function - Implement OAuth 2.0 flow here if needed
    // This could involve redirecting to an authentication page, retrieving a token, etc.
    console.log("OAuth 2.0 Authentication not implemented. Using placeholder token.");
    return "YOUR_ACCESS_TOKEN"; // Replace with actual token retrieval logic
}
