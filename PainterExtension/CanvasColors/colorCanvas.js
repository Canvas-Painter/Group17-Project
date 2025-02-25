let customStylesheet = null;

// Listen for messages from address bar popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Message received:', request);
    if (request.action === 'toggleTheme') {
        updateTheme(request.enabled, request.theme)
        sendResponse({response: 'Theme updated', status: 'success'});
    }
});

// Enable dark mode CSS with custom.css
function updateTheme(active, theme) {
    if (active) {
        // Create custom stylesheet if it doesn't exist
        if (!customStylesheet) {
            customStylesheet = document.createElement('link');
            customStylesheet.rel = 'stylesheet';
            customStylesheet.type = 'text/css';
            customStylesheet.href = chrome.runtime.getURL('CanvasColors/custom.css');
            customStylesheet.classList.add('theme');
            document.head.appendChild(customStylesheet);
        }

        // update CSS variables
        const root = document.querySelector(':root');
        root.style.setProperty('--bg-0', theme.cssVars['--bg-0']);
        root.style.setProperty('--bg-1', theme.cssVars['--bg-1']);
        root.style.setProperty('--bg-2', theme.cssVars['--bg-2']);
        root.style.setProperty('--text-0', theme.cssVars['--text-0']);
        root.style.setProperty('--text-1', theme.cssVars['--text-1']);
        root.style.setProperty('--text-2', theme.cssVars['--text-2']);
        root.style.setProperty('--sidebar', theme.cssVars['--sidebar']);
        root.style.setProperty('--links', theme.cssVars['--links']);
        root.style.setProperty('--hamburger', theme.cssVars['--hamburger']);
        root.style.setProperty('--invrt', Number(theme.cssVars['--invrt']));
        
        // add class
        document.body.classList.add('theme');
    }
    else {
        // remove class
        document.body.classList.remove('theme');
    }
}

// Instead of applying theme immediately, wait for DOMContentLoaded
document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.sync.get('current_theme', function(result) {
        // console.log('theme on load:', result.current_theme);
        if (result.current_theme !== null) {
            updateTheme(true, result.current_theme);
        }
    });
});

// Listen for storage changes to update the theme in real time (e.g., when new tabs load)
chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName === "sync" && changes.current_theme) {
        const theme = changes.current_theme.newValue;
        // console.log("Current theme updated to:", theme);
        // Make sure DOM is ready before updating the theme
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", function() {
                updateTheme(theme !== null, theme);
            });
        }
        else {
            updateTheme(theme !== null, theme);
        }
    }
});

