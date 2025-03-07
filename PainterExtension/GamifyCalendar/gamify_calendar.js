// ===============================================================
// Function to insert the gamification toggle (toggle is a 1 way)
// ===============================================================

// Insert Gamify radio button into the Resources menu (must refresh to turn gamification off)
function insertGamifyCheckbox() {
    const calendarMenuItem = document.querySelector("#global_nav_calendar_link")?.closest("li");
    const resourcesMenuItem = document.querySelector("#global_nav_Resources")?.closest("li");

    if (calendarMenuItem && resourcesMenuItem) {

        console.log("Menu items found – inserting Gamify Calendar radio button...");

        // Raw HTML of the gamification toggle switch
        const rawHTML = `
            <li class="menu-item ic-app-header__menu-list-item"> 
              <label for="toggle_gamification" class="ic-app-header__menu-list-link" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 10px; cursor: pointer;">
                <input type="radio" id="toggle_gamification" style="width: 20px; height: 20px; transition: opacity 0.2s;">
                Gamify Calendar
              </label>
            </li>
        `;
        resourcesMenuItem.insertAdjacentHTML("beforebegin", rawHTML);
        clearInterval(checkInterval);
        console.log("Radio button inserted successfully!");
        document.getElementById('toggle_gamification').addEventListener('change', handleGamifyCheckbox);
    } else {
        console.log("Waiting for menu items to load...");
    }
}

// Insert monthly (overall) progress bar
function insertPercentageDisplay() {
    const calendarContainer = document.querySelector('.calendar.fc.fc-unthemed.fc-ltr');
    if (calendarContainer && !document.getElementById("percentage-display-container")) {
        const displayHTML = `
            <div id="percentage-display-container" style="margin-bottom: 10px;">
                <h1 id="percentage-display" style="text-align: left; font-size: 18px; margin-bottom: 5px;">Loading...</h1>
                <div id="progress-bar-container" style="width: 100%; height: 10px; background-color: #ddd; border-radius: 5px; overflow: hidden;">
                    <div id="progress-bar" style="width: 0%; height: 100%; background-color: #4caf50; transition: width 0.5s ease;"></div>
                </div>
            </div>
        `;
        calendarContainer.insertAdjacentHTML('beforebegin', displayHTML);
    }
}

// Insert "up to today" progress bar
function insertProgressUpToTodayDisplay() {
    const calendarContainer = document.querySelector('.calendar.fc.fc-unthemed.fc-ltr');
    if (calendarContainer && !document.getElementById("percentage-display-up-to-today-container")) {
        const displayHTML = `
            <div id="percentage-display-up-to-today-container" style="margin-bottom: 10px;">
                <h1 id="percentage-display-up-to-today" style="text-align: left; font-size: 18px; margin-bottom: 5px;">Loading...</h1>
                <div id="progress-bar-up-to-today-container" style="width: 100%; height: 10px; background-color: #ddd; border-radius: 5px; overflow: hidden;">
                    <div id="progress-bar-up-to-today" style="width: 0%; height: 100%; background-color: #2196F3; transition: width 0.5s ease;"></div>
                </div>
            </div>
        `;
        calendarContainer.insertAdjacentHTML('beforebegin', displayHTML);
    }
}

// Insert badges above the calendar, and above the progress bars
function insertBadgesDisplay() {
    const calendarContainer = document.querySelector('.calendar.fc.fc-unthemed.fc-ltr');
    if (calendarContainer && !document.getElementById("badges-container")) {
        const badgesHTML = `
            <hr class="canvas-hr" style="border: none; border-top: 1px solid #ccc; margin: 10px 0;">
            <div id="badges-container" style="display: flex; justify-content: space-around; margin: 10px 0;">
                <div id="badge-up-to-today" class="badge locked" style="width: 50px; height: 50px; border-radius: 50%; background-color: gray; cursor: pointer;" title="Complete more assignments to unlock this badge"></div>
                <div id="badge-assignment" class="badge locked" style="width: 50px; height: 50px; border-radius: 50%; background-color: gray; cursor: pointer;" title="Complete more assignments to unlock this badge"></div>
                <div id="badge-quiz" class="badge locked" style="width: 50px; height: 50px; border-radius: 50%; background-color: gray; cursor: pointer;" title="Complete more assignments to unlock this badge"></div>
                <div id="badge-discussion" class="badge locked" style="width: 50px; height: 50px; border-radius: 50%; background-color: gray; cursor: pointer;" title="Complete more assignments to unlock this badge"></div>
                <div id="badge-overall" class="badge locked" style="width: 50px; height: 50px; border-radius: 50%; background-color: gray; cursor: pointer;" title="Complete more assignments to unlock this badge"></div>
            </div>
            <hr class="canvas-hr" style="border: none; border-top: 1px solid #ccc; margin: 10px 0;">
        `;
        calendarContainer.insertAdjacentHTML('beforebegin', badgesHTML);
    }
}

// =========================================
// Percentage functions and Progress Bars!!
// =========================================

// Update overall monthly assignment completion using only days within the current month.
function updateGamifyPercentage() {
    let weeksArray = parseCanvasCalendar();
    if (!weeksArray.length) {
        console.log("No week data available.");
        return;
    }
    let totalAssignments = 0, completedAssignments = 0;
    weeksArray.forEach(week => {
        week.days.forEach(day => {
            if (day.isInMonth) {
                totalAssignments += day.assignments.length;
                completedAssignments += day.assignments.filter(a => a.completed).length;
            }
        });
    });
    const percentage = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
    const percentageDisplay = document.getElementById('percentage-display');
    const progressBar = document.getElementById('progress-bar');
    if (percentageDisplay) {
        percentageDisplay.textContent = `${percentage.toFixed(1)}% of assignments turned in this month`;
    }
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}

// Update progress "up to today" using only days within the current month.
// Also logs what the system date is when the calculation runs.
function updateGamifyProgressUpToToday() {
    let weeksArray = parseCanvasCalendar();
    if (!weeksArray.length) {
        console.log("No week data available.");
        return;
    }
    let totalAssignments = 0, completedAssignments = 0;
    let systemToday = new Date();
    systemToday.setHours(0,0,0,0);

    weeksArray.forEach((week) => {
        week.days.forEach((day) => {
            // Only consider days within the current month.
            if (day.isInMonth && day.dataDate) {
                let cellDate = new Date(day.dataDate);
                cellDate.setHours(0,0,0,0);
                if (cellDate <= systemToday && day.day <= systemToday.getDate()) {
                    totalAssignments += day.assignments.length;
                    completedAssignments += day.assignments.filter(a => a.completed).length;
                }
            }
        });
    });
    const percentageUpToToday = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
    const progressBarUpToToday = document.getElementById('progress-bar-up-to-today');
    if (progressBarUpToToday) {
        progressBarUpToToday.style.width = `${percentageUpToToday}%`;
    }
    const progressTextUpToToday = document.getElementById('percentage-display-up-to-today');
    if (progressTextUpToToday) {
        progressTextUpToToday.textContent = `${percentageUpToToday.toFixed(1)}% of assignments completed up to today`;
    }
}

// ===============================================================================
// Parse through Calendar. Returns 3D Array: [week, day, assignment] (uses objects)
// ===============================================================================

// I will insert more comments here, I promise!!

function parseCanvasCalendar() {
    let weeksArray = [];
    // Get todays date (For second progress bar + a badge)
    let systemToday = new Date();
    systemToday.setHours(0,0,0,0);
    let todayStr = systemToday.toISOString().split('T')[0];

    const weekContainers = document.querySelectorAll('.fc-day-grid.fc-unselectable > .fc-row.fc-week.fc-widget-content');
    if (!weekContainers.length) {
        console.log("No week containers found on this calendar.");
        return weeksArray;
    }
    weekContainers.forEach((weekContainer) => {
        let week = { days: [] };
        // Pull 'day' info from the "fc-bg" section. ONLY gets information about each day, and 
        const fcBg = weekContainer.querySelector('.fc-bg');
        if (fcBg) {
            const tdElements = fcBg.querySelectorAll('table tbody tr td');
            tdElements.forEach((td) => {
                let dataDate = td.getAttribute('data-date');
                let dayNumber = Number(dataDate.slice(-2));
                let isInMonth = !td.classList.contains('fc-other-month');
                let isToday = td.classList.contains('fc-today');
                week.days.push({
                    dataDate: dataDate,
                    day: dayNumber,
                    isInMonth: isInMonth,
                    isToday: isToday,
                    assignments: []
                });
            });
        } else {
            for (let i = 0; i < 7; i++) {
                week.days.push({
                    dataDate: null,
                    day: null,
                    isInMonth: false,
                    isToday: false,
                    assignments: []
                });
            }
        }
        // Parse assignments from "fc-content-skeleton"
        const fcContentSkeleton = weekContainer.querySelector('.fc-content-skeleton');
        if (fcContentSkeleton) {
            const tbody = fcContentSkeleton.querySelector('tbody');
            if (tbody) {
                const rows = tbody.querySelectorAll('tr');
                let occupied = Array(7).fill(0);
                rows.forEach((tr) => {
                    const cells = tr.children;
                    let cellPointer = 0;
                    for (let col = 0; col < 7; col++) {
                        if (occupied[col] > 0) {
                            occupied[col]--;
                            continue;
                        }
                        if (cellPointer < cells.length) {
                            let cell = cells[cellPointer];
                            cellPointer++;
                            if (cell.classList.contains('fc-event-container')) {
                                let assignment = {};
                                const aElem = cell.querySelector('a');
                                assignment.name = aElem ? (aElem.getAttribute('title') || aElem.textContent.trim()) : "Untitled";
                                const iconElem = cell.querySelector('i');
                                if (iconElem) {
                                    if (iconElem.classList.contains('icon-quiz')) {
                                        assignment.type = "quiz";
                                    } else if (iconElem.classList.contains('icon-assignment')) {
                                        assignment.type = "assignment";
                                    } else if (iconElem.classList.contains('icon-discussion')) {
                                        assignment.type = "discussion";
                                    } else {
                                        assignment.type = "other";
                                    }
                                } else {
                                    assignment.type = "other";
                                }
                                const spanElem = cell.querySelector('span.fc-title');
                                assignment.completed = spanElem ? spanElem.classList.contains('calendar__event--completed') : false;
                                const dayInfo = week.days[col];
                                assignment.day = dayInfo ? dayInfo.day : null;
                                if (dayInfo && dayInfo.dataDate) {
                                    let cellDate = new Date(dayInfo.dataDate);
                                    assignment.notAfterToday = (cellDate <= systemToday);
                                } else {
                                    assignment.notAfterToday = false;
                                }
                                assignment.isInMonth = dayInfo ? dayInfo.isInMonth : false;
                                if (dayInfo) {
                                    dayInfo.assignments.push(assignment);
                                }
                                let rowspan = cell.getAttribute('rowspan');
                                if (rowspan) {
                                    let spanCount = parseInt(rowspan) - 1;
                                    if (!isNaN(spanCount) && spanCount > 0) {
                                        occupied[col] = spanCount;
                                    }
                                }
                            } else {
                                let rowspan = cell.getAttribute('rowspan');
                                if (rowspan) {
                                    let spanCount = parseInt(rowspan) - 1;
                                    if (!isNaN(spanCount) && spanCount > 0) {
                                        occupied[col] = spanCount;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
        weeksArray.push(week);
    });

    return weeksArray;
}

// ===========================
// Check for badges + Updates
// ===========================

/**
 * Calculates badge unlocks based on assignments within the current month.
 * For monthly badges, only days with day.isInMonth === true are counted.
 * For the up-to-today badge, only days on or before today (within the month) are considered.
 * Also computes type-specific completions (quiz, assignment, discussion).
 */
function updateBadges() {
    let weeksArray = parseCanvasCalendar();
    if (!weeksArray.length) {
        console.log("No week data available for badge calculations.");
        return;
    }

    let overallMonthTotal = 0, overallMonthCompleted = 0;
    let quizTotal = 0, quizCompleted = 0;
    let assignmentTotal = 0, assignmentCompleted = 0;
    let discussionTotal = 0, discussionCompleted = 0;
    let upToTodayTotal = 0, upToTodayCompleted = 0;
    let systemToday = new Date();
    systemToday.setHours(0,0,0,0);

    weeksArray.forEach((week) => {
        week.days.forEach((day) => {
            if (day.isInMonth) {
                overallMonthTotal += day.assignments.length;
                overallMonthCompleted += day.assignments.filter(a => a.completed).length;
                day.assignments.forEach((assignment) => {
                    if (assignment.type === "quiz") {
                        quizTotal++;
                        if (assignment.completed) quizCompleted++;
                    } else if (assignment.type === "assignment") {
                        assignmentTotal++;
                        if (assignment.completed) assignmentCompleted++;
                    } else if (assignment.type === "discussion") {
                        discussionTotal++;
                        if (assignment.completed) discussionCompleted++;
                    }
                });
            }
            if (day.isInMonth && day.dataDate) {
                let cellDate = new Date(day.dataDate);
                cellDate.setHours(0,0,0,0);
                if (cellDate <= systemToday) {
                    upToTodayTotal += day.assignments.length;
                    upToTodayCompleted += day.assignments.filter(a => a.completed).length;
                }
            }
        });
    });

    let overallPercent = overallMonthTotal > 0 ? (overallMonthCompleted / overallMonthTotal) * 100 : 0;
    let upToTodayPercent = upToTodayTotal > 0 ? (upToTodayCompleted / upToTodayTotal) * 100 : 0;
    let quizPercent = quizTotal > 0 ? (quizCompleted / quizTotal) * 100 : 0;
    let assignmentPercent = assignmentTotal > 0 ? (assignmentCompleted / assignmentTotal) * 100 : 0;
    let discussionPercent = discussionTotal > 0 ? (discussionCompleted / discussionTotal) * 100 : 0;

    let badges = {  //True or false conditions to check if badge is "unlocked"
        upToToday: upToTodayPercent >= 100,
        overallMonth: overallPercent >= 100,
        quiz: quizPercent >= 100,
        assignment: assignmentPercent >= 100,
        discussion: discussionPercent >= 100
    };

    updateBadgeElement("badge-up-to-today", badges.upToToday, "'Academic Weapon' Badge", "Complete more assignments to unlock this badge");
    updateBadgeElement("badge-overall", badges.overallMonth, "'How Did We Get Here?' Badge", "Complete more assignments to unlock this badge");
    updateBadgeElement("badge-quiz", badges.quiz, "'Quizard' Badge", "Complete more assignments to unlock this badge");
    updateBadgeElement("badge-assignment", badges.assignment, "'Completionist' Badge", "Complete more assignments to unlock this badge");
    updateBadgeElement("badge-discussion", badges.discussion, "'Certified Yapper' Badge", "Complete more assignments to unlock this badge");
}

/**
 * Updates a single badge element based on its unlocked state.
 * If unlocked, applies the designated background color and sets the title to the badge name.
 * If locked, displays as gray
 */

function updateBadgeElement(badgeId, unlocked, unlockedName, lockedTooltip) {
    const badgeElem = document.getElementById(badgeId);
    if (!badgeElem) return;
    
    // Set default opacity and attach hover events once.
    if (!badgeElem.dataset.hoverSet) {
        badgeElem.style.opacity = "0.7";
        badgeElem.onmouseover = () => { badgeElem.style.opacity = "1"; };
        badgeElem.onmouseout = () => { badgeElem.style.opacity = "0.7"; };
        badgeElem.dataset.hoverSet = "true";
    }
    
    // Determine the icon content based on the badge type (I am using emojis for simplicity)
    let iconHTML = "";
    let badgeColor = "";
    const badgeName = badgeId.replace("badge-", "");
    
    if (unlocked) {
    badgeElem.title = unlockedName;
        switch (badgeName) {
            case "up-to-today":
                iconHTML = "📈"; // Academic Weapon badge icon
                badgeColor = "#0076ec";
                break;
            case "overall":
                iconHTML = "🏆"; // How Did We Get Here? badge icon
                badgeColor = "#EEBC1D";
                break;
            case "quiz":
                iconHTML = "🧙"; // Quizard badge icon
                badgeColor = "#b903d8";
                break;
            case "assignment":
                iconHTML = "📝"; // Completionist badge icon
                badgeColor = "#009200";
                break;
            case "discussion":
                iconHTML = "💬"; // Certified Yapper badge icon
                badgeColor = "#ffba68";
                break;
            default:
                iconHTML = "⭐";
        }
    } else {
        badgeElem.title = lockedTooltip;
        // For locked badges, display a lock icon.
        iconHTML = "🔒";
    }
    
    // Update the badge's inner HTML with a centered icon.
    badgeElem.style.backgroundColor = badgeColor;
    badgeElem.innerHTML = `<span style="font-size: 2rem; display: block; text-align: center; line-height: 50px;">${iconHTML}</span>`;
}

// ============================
// Gamify Toggle Radio Handler
// ============================

function handleGamifyCheckbox() {
    const checkbox = document.getElementById('toggle_gamification');
    if (checkbox && checkbox.checked) {

        alert("Please ensure all of your current classes are checked\nand visible in your calendar.\n\nTo turn gamification off, please refresh your page!");

        // Insert progress displays first...
        insertPercentageDisplay();
        insertProgressUpToTodayDisplay();

        // Insert badges above the progress bars.
        insertBadgesDisplay();

        // Update progress and badges every 5 seconds.
        updateGamifyPercentage();
        updateGamifyProgressUpToToday();
        updateBadges();

        setInterval(updateGamifyPercentage, 5000);
        setInterval(updateGamifyProgressUpToToday, 5000);
        setInterval(updateBadges, 5000);

    } else {
        console.log("Error... Somehow unchecked radio!");
    }
}

// =====================
// Get Radio in submenu
// =====================

const checkInterval = setInterval(insertGamifyCheckbox, 500);
setTimeout(() => {
    clearInterval(checkInterval);
    console.log("Stopped checking for menu items.");
}, 10000);
