// features/gamification_rewards.js

import { getUserPoints } from "./gamification_points.js";

// Key used to store earned badges in Chrome local storage
const BADGE_STORAGE_KEY = "canvas_user_badges";

/**
 * Applies rewards based on assignment completion.
 * Awards badges for the first and last completed assignments in a class.
 * @param {Object} assignment - The assignment object containing context ID and due date.
 */
export async function applyRewards(assignment) {
    let userBadges = await getUserBadges();
    let classId = assignment.context_id; // Unique class identifier from Canvas
    let className = assignment.context_name || "Unknown Class"; // Retrieve class name if available
    
    if (!userBadges[classId]) {
        userBadges[classId] = {}; // Initialize storage for the class if not present
    }
    
    // Award badge for completing the first assignment in a class
    if (!userBadges[classId].firstAssignmentCompleted) {
        userBadges[classId].firstAssignmentCompleted = true;
        await saveUserBadges(userBadges);
        displayBadge(`🎖️ First Assignment Completed in ${className}!`);
    }
    
    // Award badge for completing the last assignment in a class
    if (await isLastAssignment(assignment)) {
        if (!userBadges[classId].lastAssignmentCompleted) {
            userBadges[classId].lastAssignmentCompleted = true;
            await saveUserBadges(userBadges);
            displayBadge(`🏆 Final Assignment Completed in ${className}!`);
        }
    }
}

/**
 * Retrieves the user's earned badges from Chrome local storage.
 * @returns {Promise<Object>} A promise that resolves to the user's badges.
 */
async function getUserBadges() {
    return new Promise((resolve) => {
        chrome.storage.local.get([BADGE_STORAGE_KEY], (result) => {
            resolve(result[BADGE_STORAGE_KEY] || {});
        });
    });
}

/**
 * Saves the user's earned badges to Chrome local storage.
 * @param {Object} badges - The updated badge data to store.
 * @returns {Promise<void>}
 */
async function saveUserBadges(badges) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [BADGE_STORAGE_KEY]: badges }, () => {
            resolve();
        });
    });
}

/**
 * Displays a badge notification in the Canvas sidebar.
 * @param {string} badgeText - The text describing the earned badge.
 */
function displayBadge(badgeText) {
    let sideMenu = document.getElementById("canvas-enhancer-side-menu");
    if (!sideMenu) return;
    
    let badgeDisplay = document.createElement("div");
    badgeDisplay.className = "badge-display";
    badgeDisplay.innerText = badgeText;
    badgeDisplay.style.padding = "10px";
    badgeDisplay.style.margin = "5px 0";
    badgeDisplay.style.background = "#4CAF50";
    badgeDisplay.style.color = "white";
    badgeDisplay.style.borderRadius = "5px";
    
    sideMenu.appendChild(badgeDisplay);
}

/**
 * Determines if the given assignment is the last one in the class.
 * Fetches all assignments from the Canvas API and compares due dates.
 * @param {Object} assignment - The assignment to check.
 * @returns {Promise<boolean>} A promise that resolves to true if the assignment is the last one.
 */
async function isLastAssignment(assignment) {
    try {
        const response = await fetch("https://canvas.instructure.com/api/v1/calendar_events?type=assignment", {
            headers: {
                "Authorization": `Bearer ${await getAccessToken()}`
            }
        });
        
        if (!response.ok) throw new Error("Failed to fetch assignments");
        
        const assignments = await response.json();
        const dueDates = assignments.map(a => new Date(a.due_at)).sort((a, b) => b - a);
        
        return new Date(assignment.due_at).getTime() === dueDates[0].getTime();
    } catch (error) {
        console.error("Error checking last assignment:", error);
        return false;
    }
}