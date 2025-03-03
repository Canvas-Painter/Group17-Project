// features/gamification_points.js

// Key used to store user points in Chrome local storage
const POINTS_STORAGE_KEY = "canvas_user_points";

// Retrieves the user's current points from local storage
export async function getUserPoints() {
    return new Promise((resolve) => {
        chrome.storage.local.get([POINTS_STORAGE_KEY], (result) => {
            resolve(result[POINTS_STORAGE_KEY] || 0); // Default to 0 if no points are found
        });
    });
}

// Updates the user's points based on assignment completion and early submission
export async function updatePoints(assignment) {
    let currentPoints = await getUserPoints(); // Retrieve current points
    let basePoints = 10; // Base points for completing an assignment
    let completionDate = new Date(); // The current date when the assignment is marked complete
    let dueDate = new Date(assignment.due_at); // The assignment's due date

    // Calculate bonus points for early submission
    let daysEarly = Math.max(0, Math.ceil((dueDate - completionDate) / (1000 * 60 * 60 * 24)));
    let totalPoints = basePoints + daysEarly; // Total points awarded

    let newPoints = currentPoints + totalPoints; // Update the user's total points

    return new Promise((resolve) => {
        chrome.storage.local.set({ [POINTS_STORAGE_KEY]: newPoints }, () => {
            resolve(newPoints);
        });
    });
}

// Checks for completed assignments by fetching from the Canvas API
export async function checkCompletedAssignments() {
    try {
        const response = await fetch("https://canvas.instructure.com/api/v1/calendar_events?type=assignment", {
            headers: {
                "Authorization": `Bearer ${await getAccessToken()}` // Retrieve and use OAuth token
            }
        });

        if (!response.ok) throw new Error("Failed to fetch assignments"); // Error handling if request fails

        const assignments = await response.json(); // Parse the JSON response
        assignments.forEach(async (assignment) => {
            if (isAssignmentCompleted(assignment)) { // Check if the assignment is marked complete
                await updatePoints(assignment); // Award points accordingly
            }
        });
    } catch (error) {
        console.error("Error checking completed assignments:", error);
    }
}

// Determines if an assignment is marked as completed in Canvas
function isAssignmentCompleted(assignment) {
    let assignmentElement = document.querySelector(`[data-due-date='${assignment.due_at}']`);
    return assignmentElement && assignmentElement.style.textDecoration === "line-through"; // Checks if it's crossed out
}
