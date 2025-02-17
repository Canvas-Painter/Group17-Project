let darkModeStylesheet = null;

// Set the theme
function setTheme(theme) {
    localStorage.setItem('theme', theme);
    if (theme !== '') {
        enableTheme(theme); // Apply the theme immediately
    }
}

// Check and apply the theme on page load
window.onload = function() {
    const theme = localStorage.getItem('theme') || ''; // Default to '' if no theme is set
    if (theme !== '') {
        enableTheme(theme); // Apply the theme immediately
    }
};

// Listen for messages from address bar popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'toggleDarkMode') {
        if (request.enabled) {
            setTheme('darkmode');
        } else {
            disableTheme('darkmode');
            setTheme('');
        }
        console.log('ColorCanvas: Dark mode is now:', request.enabled ? 'enabled' : 'disabled');
    }
});

// Enable dark mode CSS with custom.css
function enableTheme(theme) {
    if (!darkModeStylesheet) {
        darkModeStylesheet = document.createElement('link');
        darkModeStylesheet.rel = 'stylesheet';
        darkModeStylesheet.type = 'text/css';
        darkModeStylesheet.href = chrome.runtime.getURL('CanvasColors/custom.css');
        document.head.appendChild(darkModeStylesheet);
    }
    document.body.classList.add(theme);
}

// Remove dark mode CSS
function disableTheme(theme) {
    if (darkModeStylesheet) {
        darkModeStylesheet.remove();
        darkModeStylesheet = null;
    }
    document.body.classList.remove(theme);
}