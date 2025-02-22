let customStylesheet = null;
const darkmode = {'--bg-0': '#383838',
                  '--bg-1': '#4c4c4c',
                  '--bg-2': '#transparent',
                  '--text-0': '#e7e7e7',
                  '--text-1': '#f8bc80',
                  '--text-2': '#f8a451',
                  '--sidebar': '#D73F09',
                  '--links': '#f58c02',
                  '--hamburger': '#f58c02',
                  '--invrt': '1',
};

// Function to check if darkmode is already in storage
function isDarkModeInStorage() {
    console.log('isDarkModeInStorage() called');
    return new Promise((resolve) => {
        chrome.storage.sync.get(['darkmode'], (result) => {
            resolve(result.darkmode !== undefined);
        });
    });
}

// Function to set darkmode in storage if it's not already there
async function initializeDarkModeInStorage() {
    console.log('initializeDarkModeInStorage() called');
    const alreadyExists = await isDarkModeInStorage();
    if (!alreadyExists) {
        chrome.storage.sync.set({ darkmode: darkmode }, () => {
            console.log('Darkmode initialized in storage.');
        });
    } else {
        console.log('Darkmode already exists in storage.');
    }
}

console.log('checking storage');
chrome.storage.sync.get(null, function(items) {
    console.log(items);
});
console.log('~~~ DONE ~~~');

// Initialize darkmode in storage on script load
initializeDarkModeInStorage();


// Check stored state on load
chrome.storage.sync.get(['theme'], function(result) {
    if (result.theme) {
        enableTheme(theme);
    }
});

// Get the theme from localstorage
function getTheme() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['theme'], (result) => {
            resolve(result.theme);
        });
    });
}

// Listen for messages from address bar popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'toggleDarkMode') {
        if (request.enabled) {
            console.log('Darkmode Theme');
            enableTheme(darkmode);
        } else {
            disableTheme();
        }
        console.log('ColorCanvas: DarkMode is now:', request.enabled ? 'enabled' : 'disabled');
    } else if (request.action === 'toggleTheme') {
        if (request.enabled) {
            console.log('Custom Theme');
            enableTheme(getTheme());
        } else {
            disableTheme();
        }
        console.log('ColorCanvas: Theme is now:', request.enabled ? 'enabled' : 'disabled');
    }
});

// Enable dark mode CSS with custom.css
function enableTheme(theme) {
    if (!customStylesheet) {
        customStylesheet = document.createElement('link');
        customStylesheet.rel = 'stylesheet';
        customStylesheet.type = 'text/css';
        customStylesheet.href = chrome.runtime.getURL('CanvasColors/custom.css');
        customStylesheet.classList.add('theme');
        document.head.appendChild(customStylesheet);
    }
    console.log('enableTheme:', theme);

    // // Get the stylesheet
    // let stylesheet = null;
    // for (let i = 0; i < document.styleSheets.length; i++) {
    //     const sheet = document.styleSheets[i];
    //     console.log('sheet:', sheet);
    //     if (sheet.ownerNode && sheet.ownerNode.classList.contains('theme')) {
    //         stylesheet = sheet;
    //         break;
    //     }
    // }

    // console.log('stylesheet:', stylesheet);

    // Update CSS variables
    // if (stylesheet) {
    const root = document.querySelector(':root');
    console.log('root:', getComputedStyle(root));
    console.log('--bg-0:', root.style.getPropertyValue('--bg-0'));


    root.style.setProperty('--bg-0', theme['--bg-0']);
    root.style.setProperty('--bg-1', theme['--bg-1']);
    root.style.setProperty('--bg-2', theme['--bg-2']);
    root.style.setProperty('--text-0', theme['--text-0']);
    root.style.setProperty('--text-1', theme['--text-1']);
    root.style.setProperty('--text-2', theme['--text-2']);
    root.style.setProperty('--sidebar', theme['--sidebar']);
    root.style.setProperty('--links', theme['--links']);
    root.style.setProperty('--hamburger', theme['--hamburger']);
    root.style.setProperty('--invrt', theme['--invrt']);
    // }
    
    document.body.classList.add('theme');
}

// Remove dark mode CSS
function disableTheme() {
    if (customStylesheet) {
        customStylesheet.remove();
        customStylesheet = null;
    }
    document.body.classList.remove('theme');

}
