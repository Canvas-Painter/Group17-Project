document.addEventListener("DOMContentLoaded", function () {
    const darkmodeButton = document.getElementById("darkmode-btn");
    const themeButton = document.getElementById("applyTheme-btn");

    if (!darkmodeButton) {
        console.error("Dark mode button not found in the document");
        return;
    }

    // Load saved state
    chrome.storage.sync.get(['theme'], function(result) {
        darkmodeButton.checked = result.theme || result.darkMode || false;
    });

    darkmodeButton.addEventListener('change', function() {
        const isEnabled = darkmodeButton.checked;
        
        // Save state
        chrome.storage.sync.set({ darkMode: isEnabled });
        chrome.storage.sync.set({ theme: false });
        
        // Send message to colorCanvas.js
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleDarkMode',
                enabled: isEnabled
            });
        });
    });

    themeButton.addEventListener('change', function() {
        const isEnabled = themeButton.checked;
        
        // Save state
        chrome.storage.sync.set({ theme: isEnabled });
        chrome.storage.sync.set({ darkMode: false });
        
        // Send message to colorCanvas.js
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleTheme',
                enabled: isEnabled
            });
        });
    });
});
