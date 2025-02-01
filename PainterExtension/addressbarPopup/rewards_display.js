// popup/rewards_display.js

// This allows the user to see the rewards earned by gamify calendar here.

import { getUserBadges } from "../features/gamification_rewards.js";

export async function displayEarnedRewards() {
    let rewardsContainer = document.getElementById("earned-rewards-container");
    if (!rewardsContainer) return;
    
    let userBadges = await getUserBadges();
    rewardsContainer.innerHTML = "<h3>Earned Rewards</h3>";
    
    Object.keys(userBadges).forEach(classId => {
        let classRewards = userBadges[classId];
        let classRewardsList = document.createElement("ul");
        
        rewardsContainer.innerHTML += `<h4>Class: ${classId}</h4>`;
        
        if (classRewards.firstAssignmentCompleted) {
            let li = document.createElement("li");
            li.innerText = "🎖️ First Assignment Completed";
            classRewardsList.appendChild(li);
        }
        
        if (classRewards.lastAssignmentCompleted) {
            let li = document.createElement("li");
            li.innerText = "🏆 Final Assignment Completed";
            classRewardsList.appendChild(li);
        }
        
        rewardsContainer.appendChild(classRewardsList);
    });
}