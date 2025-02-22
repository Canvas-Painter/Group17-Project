let darkModeStylesheet = null;

// Check stored state on load
chrome.storage.sync.get(['darkMode'], function(result) {
    if (result.darkMode) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
});

// Listen for messages from address bar popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'toggleDarkMode') {
        if (request.enabled) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
        console.log('ColorCanvas: Dark mode is now:', request.enabled ? 'enabled' : 'disabled');
    }
});

// Enable dark mode CSS with custom.css
function enableDarkMode() {
    if (!darkModeStylesheet) {
        darkModeStylesheet = document.createElement('link');
        darkModeStylesheet.rel = 'stylesheet';
        darkModeStylesheet.type = 'text/css';
        darkModeStylesheet.href = chrome.runtime.getURL('CanvasColors/custom.css');
        document.head.appendChild(darkModeStylesheet);
    }
    document.body.classList.add('darkmode');
    
}

// Remove dark mode CSS
function disableDarkMode() {
    if (darkModeStylesheet) {
        darkModeStylesheet.remove();
        darkModeStylesheet = null;
    }
    document.body.classList.remove('darkmode');

}
