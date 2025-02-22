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

    /*
    const themeNameInput = document.getElementById("themeName");
    const bg0Input = document.getElementById("--bg-0");
    const bg1Input = document.getElementById("--bg-1");
    const bg2Input = document.getElementById("--bg-2"); 
    const text0Input = document.getElementById("--text-0");
    const text1Input = document.getElementById("--text-1");
    const text2Input = document.getElementById("--text-2");
    const text3Input = document.getElementById("--text-3");
    const sidebarInput = document.getElementById("--sidebar");
    const linksInput = document.getElementById("--links");
    const hamburgerInput = document.getElementById("--hamburger");
    const invrtInput = document.getElementById("--invrt");
    */

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
