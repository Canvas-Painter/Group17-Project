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
    
    // try {
    //     var mini_calendars = document.querySelectorAll('.day_wrapper');
    //     mini_calendars.forEach(element => {
    //         element.classList.add('darkmode');
    //     });
    // } catch {
    //     console.log('no ".day_wrapper" class found...');
    // }

    try {
        var mini_calendars = document.querySelectorAll('#content_wrapper');
        mini_calendars.forEach(element => {
            element.classList.add('darkmode');
        });
    } catch {
        console.log('no "#content_wrapper" id found...');
    }

    try {
        var role_link = document.querySelectorAll('#breadcrumbs');
        role_link.forEach(element => {
            element.style.backgroundColor = 'transparent';
        });
    } catch {
        console.log('no "#breadcrumbs" id found...');
    }

    try {
        var header_bar = document.querySelectorAll('.header-bar');
        header_bar.forEach(element => {
            element.style.backgroundColor = 'transparent';
        });
    } catch {
        console.log('no ".header-bar" class found...');
    }

    try {
        var tr = document.querySelector('#syllabusTableBody').querySelectorAll("tr");
        tr.forEach(element => {
            var td = element.querySelectorAll("td");
            td.forEach(element => {
                element.style.backgroundColor = 'transparent';
            });
        });
    } catch {
        console.log('no "#syllabusTableBody" id found...');
    }

    try {
        var context_modules = document.querySelectorAll(".context_modules");
        context_modules.forEach(element => {
            var context_module = element.querySelectorAll(".context_module");
            context_module.forEach(element => {
                var headers = element.querySelectorAll('.ig-header');
                headers.forEach(element => {
                    element.style.backgroundColor = 'green';
                });
            });
        });
    } catch {
        console.log('no ".context_modules" class found...');
    }

    try {
        var headers = element.querySelectorAll('.header');
        headers.forEach(element => {
            element.style.backgroundColor = 'green';
        });

    } catch {
        console.log('no ".header" class found...');
    }

    try {
        var headers = element.querySelectorAll('.context_module_item');
        headers.forEach(element => {
            element.style.backgroundColor = 'blue';
        });

    } catch {
        console.log('no ".context_module_item" class found...');
    }
    
}

// Remove dark mode CSS
function disableDarkMode() {
    if (darkModeStylesheet) {
        darkModeStylesheet.remove();
        darkModeStylesheet = null;
    }
    document.body.classList.remove('darkmode');

    // try {
    //     var mini_calendars = document.querySelectorAll('.day_wrapper');
    //     mini_calendars.forEach(element => {
    //         element.classList.remove('darkmode');
    //     });
    // } catch {
    //     console.log('no ".day_wrapper" class found...');
    // }

    try {
        var mini_calendars = document.querySelectorAll('#content_wrapper');
        mini_calendars.forEach(element => {
            element.classList.remove('darkmode');
        });
    } catch {
        console.log('no "#content_wrapper" id found...');
    }

    try {
        var tr = document.querySelector('#syllabusTableBody').querySelectorAll("tr");
        tr.forEach(element => {
            var td = element.querySelectorAll("td");
            td.forEach(element => {
                element.style.backgroundColor = '';
            });
        });
    } catch {
        console.log('no "#syllabusTableBody" id found...');
    }

    try {
        var context_modules = document.querySelectorAll(".context_modules");
        context_modules.forEach(element => {
            var context_module = element.querySelectorAll(".context_module");
            context_module.forEach(element => {
                var headers = element.querySelectorAll('.ig-header');
                headers.forEach(element => {
                    element.style.backgroundColor = '';
                });
            });
        });
    } catch {
        console.log('no ".context_modules" class found...');
    }
}