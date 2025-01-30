function waitForNavMenu() {
    const checkInterval = setInterval(() => {
        console.log("Checking for menu...");
        const menu = document.getElementById('section-tabs');
        if (menu) {
            console.log("Menu found! Adding link...");
            addStandardSyllabusLink(menu);
            clearInterval(checkInterval);
        }
    }, 10);

    document.addEventListener('DOMContentLoaded', () => {
        const menu = document.getElementById('section-tabs');
        if (!menu) {
            console.log("DOMContentLoaded reached without finding menu - stopping checks");
            clearInterval(checkInterval);
        }
    });
}

function addStandardSyllabusLink(menu) {
    const newItem = document.createElement('li');
    newItem.className = 'section';
    
    const newLink = document.createElement('a');
    newLink.href = '#';
    newLink.textContent = 'Standard Syllabus';
    newLink.className = 'standard-syllabus standardized-syllabus-feature';
    newLink.tabIndex = '0';
    
    newLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSyllabusPopup();
    });
    
    newItem.appendChild(newLink);
    menu.appendChild(newItem);
}

function showSyllabusPopup() {
    const wrapper = document.createElement('div');
    wrapper.className = 'standardized-syllabus-feature popup-wrapper';
    
    const popup = document.createElement('div');
    popup.className = 'syllabus-popup';
    
    // Close function to reuse
    const closePopup = () => wrapper.remove();
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = 'X';
    closeBtn.onclick = closePopup;
    
    // Handle click outside
    wrapper.addEventListener('click', (e) => {
        if (e.target === wrapper) {
            closePopup();
        }
    });
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePopup();
        }
    }, { once: true }); // Remove listener after first escape
    
    const table = document.createElement('table');
    table.innerHTML = `
        <tr><td>Professor name:</td><td>James</td></tr>
        <tr><td>Email:</td><td>james@gmail.com</td></tr>
    `;
    
    popup.appendChild(closeBtn);
    popup.appendChild(table);
    wrapper.appendChild(popup);
    document.body.appendChild(wrapper);
}
