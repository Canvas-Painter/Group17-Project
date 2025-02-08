document.getElementById("helpButton").addEventListener("click", function () {
    chrome.tabs.create({ url: chrome.runtime.getURL("HelpInfo/help.html") });
});
