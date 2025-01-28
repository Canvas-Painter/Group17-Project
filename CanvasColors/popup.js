// popup.js
document.addEventListener("DOMContentLoaded", function () {


    function injectCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL('custom.css');  // Path to the custom CSS file within the extension
        document.head.appendChild(link);  // Append the link tag to the <head> of the document
    }
    
    // Call injectCSS to inject the CSS
    injectCSS();

    let theme = localStorage.getItem('theme');
    if (theme != null) toggleTheme(true, theme); // not working


    const darkmodeButton = document.getElementById("darkmode-btn");
    darkmodeButton.addEventListener("click", function () {  
        const isChecked = darkmodeButton.checked;
        console.log('listener: '.concat(isChecked));

        // Send a message to the content script to toggle dark mode
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: toggleTheme,
                args: [isChecked, 'darkmode']  // 
            });
        });
    });

    function toggleTheme(enabled, theme) {
        if (enabled) {
            document.body.className = theme;
            localStorage.setItem('theme', theme);
        } else {
            document.body.className="";
            localStorage.setItem('theme', null);
        }
    }
    
});
