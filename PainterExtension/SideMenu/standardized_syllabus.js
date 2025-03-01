function activateSideMenu() {
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
    // Extract course ID from current URL
    const courseId = window.location.pathname.match(/\/courses\/(\d+)/)?.[1] || 'unknown';

    const wrapper = document.createElement('div');
    wrapper.className = 'standardized-syllabus-feature popup-wrapper';

    const popup = document.createElement('div');
    popup.className = 'syllabus-popup';

    const closePopup = () => wrapper.remove();

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = 'X';
    closeBtn.onclick = closePopup;

    const popoutBtn = document.createElement('span');
    popoutBtn.className = 'popout-btn';
    popoutBtn.textContent = '⤢';

    const syllabusUrl = `${chrome.runtime.getURL('SideMenu/standard_syllabus.html')}?courseId=${courseId}`;

    popoutBtn.onclick = () => {
        const syllabusWindow = window.open(syllabusUrl, 'StandardSyllabus',
            'width=800,height=600,menubar=no,toolbar=no,location=no,status=no');
        closePopup();
    };

    const controls = document.createElement('div');
    controls.className = 'popup-controls';
    controls.appendChild(popoutBtn);
    controls.appendChild(closeBtn);

    const iframe = document.createElement('iframe');
    iframe.src = syllabusUrl;
    iframe.className = 'syllabus-iframe';

    wrapper.addEventListener('click', (e) => {
        if (e.target === wrapper) closePopup();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePopup();
    }, { once: true });

    popup.appendChild(controls);
    popup.appendChild(iframe);
    wrapper.appendChild(popup);
    document.body.appendChild(wrapper);
}

activateSideMenu();