document.addEventListener("DOMContentLoaded", function () {
    const darkmodeButton = document.getElementById("darkmode-btn");

    if (!darkmodeButton) {
        console.error("Dark mode button not found in the document");
        return;
    }

    // Load saved state
    chrome.storage.sync.get(['darkMode'], function(result) {
        darkmodeButton.checked = result.darkMode || false;
    });

    darkmodeButton.addEventListener('change', function() {
        const isEnabled = darkmodeButton.checked;
        
        // Save state
        chrome.storage.sync.set({ darkMode: isEnabled });
        
        // Send message to colorCanvas.js
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleDarkMode',
                enabled: isEnabled
            });
        });
    });
});