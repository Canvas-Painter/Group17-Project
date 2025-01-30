// features/gamified_calendar.js

import { updatePoints, getUserPoints } from "./gamification_points.js";
import { applyRewards } from "./gamification_rewards.js";

/**
 * Initializes the gamified calendar feature.
 * Sets up the calendar enhancements and displays upcoming assignments.
 */
export function initializeGamifiedCalendar() {
    console.log("Gamified Calendar Feature Loaded");
    
    document.addEventListener("DOMContentLoaded", async () => {
        setupGamification();
        displayUpcomingAssignments();
    });
}

/**
 * Sets up gamification elements for the Canvas calendar.
 * Enhances UI and updates points display in the sidebar.
 */
function setupGamification() {
    enhanceCanvasCalendar();
    updateSidebarPoints();
}

/**
 * Enhances the Canvas calendar by adding a gamification banner.
 */
function enhanceCanvasCalendar() {
    let calendar = document.querySelector("#calendar-container");
    if (!calendar) return;
    
    let gamificationBanner = document.createElement("div");
    gamificationBanner.id = "gamification-banner";
    gamificationBanner.style.padding = "10px";
    gamificationBanner.style.background = "#FFD700";
    gamificationBanner.style.borderRadius = "5px";
    gamificationBanner.style.marginBottom = "10px";
    gamificationBanner.innerHTML = `<strong>Gamified Calendar:</strong> Earn points for completing assignments early!`;
    
    calendar.prepend(gamificationBanner);
}

/**
 * Displays a list of upcoming assignments in the sidebar.
 */
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

/**
 * Fetches upcoming assignments from the Canvas API.
 */
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

/**
 * Updates the sidebar with a list of upcoming assignments.
 * @param {Array} assignments - List of assignments retrieved from the Canvas API.
 */
function updateAssignmentList(assignments) {
    let assignmentsList = document.getElementById("assignments-list");
    assignmentsList.innerHTML = "";
    
    assignments.forEach(assignment => {
        let li = document.createElement("li");
        li.innerText = `${assignment.title} - Due: ${new Date(assignment.due_at).toLocaleDateString()}`;
        li.dataset.dueDate = assignment.due_at;
        li.addEventListener("click", () => completeAssignment(assignment));
        assignmentsList.appendChild(li);
    });
}

/**
 * Marks an assignment as completed and updates the user's points.
 * Awards bonus points for early completion.
 * @param {Object} assignment - The completed assignment object.
 */
async function completeAssignment(assignment) {
    const dueDate = new Date(assignment.due_at);
    const completionDate = new Date();
    let pointsEarned = 10; // Base points for completion
    
    if (completionDate < dueDate) {
        pointsEarned += 5; // Bonus for early completion
    }
    
    await updatePoints(pointsEarned);
    applyRewards();
    updateSidebarPoints();
    alert(`You earned ${pointsEarned} points for completing '${assignment.title}'!`);
}

/**
 * Updates the sidebar with the user's current points.
 */
async function updateSidebarPoints() {
    let sideMenu = document.getElementById("canvas-enhancer-side-menu");
    if (!sideMenu) return;
    
    let pointsDisplay = document.getElementById("user-points-display");
    if (!pointsDisplay) {
        pointsDisplay = document.createElement("div");
        pointsDisplay.id = "user-points-display";
        sideMenu.prepend(pointsDisplay);
    }
    
    const userPoints = await getUserPoints();
    pointsDisplay.innerHTML = `<strong>Points:</strong> ${userPoints}`;
}
