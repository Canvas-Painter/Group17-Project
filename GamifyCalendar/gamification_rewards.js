// features/gamification_rewards.js

import { getUserPoints } from "./gamification_points.js";

const BADGE_STORAGE_KEY = "canvas_user_badges";

export async function applyRewards(assignment) {
    let userBadges = await getUserBadges();
    let classId = assignment.context_id; // Unique class identifier from Canvas
    let className = assignment.context_name || "Unknown Class"; // Ensure class name is retrieved
    
    if (!userBadges[classId]) {
        userBadges[classId] = {};
    }
    
    if (!userBadges[classId].firstAssignmentCompleted) {
        userBadges[classId].firstAssignmentCompleted = true;
        await saveUserBadges(userBadges);
        displayBadge(`First Assignment Completed in ${className}! 🎖️`);
    }
    
    if (await isLastAssignment(assignment)) {
        if (!userBadges[classId].lastAssignmentCompleted) {
            userBadges[classId].lastAssignmentCompleted = true;
            await saveUserBadges(userBadges);
            displayBadge(`Final Assignment Completed in ${className}! 🏆`);
        }
    }
}

async function getUserBadges() {
    return new Promise((resolve) => {
        chrome.storage.local.get([BADGE_STORAGE_KEY], (result) => {
            resolve(result[BADGE_STORAGE_KEY] || {});
        });
    });
}

async function saveUserBadges(badges) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [BADGE_STORAGE_KEY]: badges }, () => {
            resolve();
        });
    });
}

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
