// features/ta_schedule.js

// Initializes the TA Schedule feature on the Canvas dashboard
export function initializeTASchedule() {
    console.log("TA Schedule Module Loaded");
    
    // Locate the dashboard area where the TA schedule should be inserted
    let dashboard = document.querySelector("#dashboard");
    if (!dashboard) return; // Exit if the dashboard is not found
    
    // Create a container for displaying the TA office hours
    let scheduleContainer = document.createElement("div");
    scheduleContainer.id = "ta-schedule-container";
    scheduleContainer.innerHTML = `<h3>TA Office Hours</h3><p>Loading...</p>`;
    dashboard.appendChild(scheduleContainer); // Append the container to the dashboard
    
    // Fetch and display TA hours from the syllabus page
    fetchTASchedule(scheduleContainer);
}

async function fetchTASchedule(container) {
    try {
        // Navigate to the syllabus page and extract TA hours
        let syllabusPage = await fetch(window.location.origin + "/courses/" + getCourseId() + "/assignments/syllabus");
        let text = await syllabusPage.text();
        
        // Create a temporary DOM parser to extract content
        let parser = new DOMParser();
        let doc = parser.parseFromString(text, "text/html");
        
        // Attempt to find relevant TA office hours information
        let syllabusContent = doc.querySelector("#syllabusContainer");
        let taHoursText = extractTASchedule(syllabusContent.innerText);
        
        // Update the container with extracted TA hours
        container.innerHTML = `<h3>TA Office Hours</h3><p>${taHoursText || "TA Hours Not Found"}</p>`;
    } catch (error) {
        console.error("Error fetching TA schedule:", error);
        container.innerHTML = `<h3>TA Office Hours</h3><p>Error fetching data</p>`;
    }
}

// Extracts TA schedule information from the syllabus content
function extractTASchedule(text) {
    let match = text.match(/TA Office Hours:([\s\S]*?)(?=\n\n|$)/i);
    return match ? match[1].trim() : null;
}

// Retrieves the course ID from the URL
function getCourseId() {
    let match = window.location.pathname.match(/courses\/(\d+)/);
    return match ? match[1] : null;
}