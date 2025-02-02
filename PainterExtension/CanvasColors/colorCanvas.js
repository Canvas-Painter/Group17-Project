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
    
    var mini_calendars = document.querySelectorAll('.day_wrapper');
    mini_calendars.forEach(element => {
        element.classList.add('darkmode');
    });

    var mini_calendars = document.querySelectorAll('#content_wrapper');
    mini_calendars.forEach(element => {
        element.classList.add('darkmode');
    });

    var role_link = document.querySelectorAll('#breadcrumbs');
    role_link.forEach(element => {
        element.style.backgroundColor = 'transparent';
    });

    var header_bar = document.querySelectorAll('.header-bar');
    header_bar.forEach(element => {
        element.style.backgroundColor = 'transparent';
    });

    var tr = document.querySelector('#syllabusTableBody').querySelectorAll("tr");
    tr.forEach(element => {
        var td = element.querySelectorAll("td");
        td.forEach(element => {
            element.style.backgroundColor = 'transparent';
        });
    });
}

// Remove dark mode CSS
function disableDarkMode() {
    if (darkModeStylesheet) {
        darkModeStylesheet.remove();
        darkModeStylesheet = null;
    }
    document.body.classList.remove('darkmode');
    var mini_calendars = document.querySelectorAll('.day_wrapper');
    mini_calendars.forEach(element => {
        element.classList.remove('darkmode');
    });

    var mini_calendars = document.querySelectorAll('#content_wrapper');
    mini_calendars.forEach(element => {
        element.classList.remove('darkmode');
    });

    var tr = document.querySelector('#syllabusTableBody').querySelectorAll("tr");
    tr.forEach(element => {
        var td = element.querySelectorAll("td");
        td.forEach(element => {
            element.style.backgroundColor = '';
        });
    });
}