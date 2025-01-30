// features/gamification_points.js

const POINTS_STORAGE_KEY = "canvas_user_points";

export async function getUserPoints() {
    return new Promise((resolve) => {
        chrome.storage.local.get([POINTS_STORAGE_KEY], (result) => {
            resolve(result[POINTS_STORAGE_KEY] || 0);
        });
    });
}

export async function updatePoints(assignment) {
    let currentPoints = await getUserPoints();
    let basePoints = 10;
    let completionDate = new Date();
    let dueDate = new Date(assignment.due_at);
    
    // Calculate bonus points for early submission
    let daysEarly = Math.max(0, Math.ceil((dueDate - completionDate) / (1000 * 60 * 60 * 24)));
    let totalPoints = basePoints + daysEarly;
    
    let newPoints = currentPoints + totalPoints;
    
    return new Promise((resolve) => {
        chrome.storage.local.set({ [POINTS_STORAGE_KEY]: newPoints }, () => {
            resolve(newPoints);
        });
    });
}

export async function checkCompletedAssignments() {
    try {
        const response = await fetch("https://canvas.instructure.com/api/v1/calendar_events?type=assignment", {
            headers: {
                "Authorization": `Bearer ${await getAccessToken()}`
            }
        });
        
        if (!response.ok) throw new Error("Failed to fetch assignments");
        
        const assignments = await response.json();
        assignments.forEach(async (assignment) => {
            if (isAssignmentCompleted(assignment)) {
                await updatePoints(assignment);
            }
        });
    } catch (error) {
        console.error("Error checking completed assignments:", error);
    }
}

function isAssignmentCompleted(assignment) {
    let assignmentElement = document.querySelector(`[data-due-date='${assignment.due_at}']`);
    return assignmentElement && assignmentElement.style.textDecoration === "line-through";
}
