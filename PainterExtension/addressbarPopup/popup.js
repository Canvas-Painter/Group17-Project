document.addEventListener("DOMContentLoaded", function () {
    const darkmodeButton = document.getElementById("darkmode-btn");
    const themeButton = document.getElementById("applyTheme-btn");
    const saveButton = document.getElementById("saveTheme-btn");
    const deleteButton = document.getElementById("deleteTheme-btn");
    const editButton = document.getElementById("editTheme-btn");
    const themeDropdown = document.getElementById("existingThemes");

    // Input fields for new theme values
    const themeNameInput = document.getElementById("themeName");
    const bg0Input = document.getElementById("--bg-0");
    const bg1Input = document.getElementById("--bg-1");
    const bg2Input = document.getElementById("--bg-2"); 
    const text0Input = document.getElementById("--text-0");
    const text1Input = document.getElementById("--text-1");
    const text2Input = document.getElementById("--text-2");
    const sidebarInput = document.getElementById("--sidebar");
    const linksInput = document.getElementById("--links");
    const hamburgerInput = document.getElementById("--hamburger");
    const invrtInput = document.getElementById("--invrt");

    // darkmode
    const darkmode = {  name: 'darkmode',
                        cssVars: {
                            '--bg-0': '#383838',
                            '--bg-1': '#4c4c4c',
                            '--bg-2': '#transparent',
                            '--text-0': '#e7e7e7',
                            '--text-1': '#f8bc80',
                            '--text-2': '#f8a451',
                            '--sidebar': '#D73F09',
                            '--links': '#f58c02',
                            '--hamburger': '#f58c02',
                            '--invrt': '1'
                        }
};

    // On load, if a current_theme object doesn't exist, create one
    chrome.storage.sync.get('current_theme', function(result) {
        if (!result.current_theme || typeof result.current_theme !== "object") {
            chrome.storage.sync.set({ current_theme : null }, function() {
                // console.log("Empty 'current_theme' obj created");
            });
        }
        chrome.storage.sync.get('current_theme', function(result) {
            if (result.current_theme !== null) {
                if (result.current_theme.name === 'darkmode') {
                    darkmodeButton.checked = true;
                    themeButton.disabled = true;
                } else {
                    themeButton.checked = true;
                    darkmodeButton.disabled = true;
                }
            }
        });
    });

    // On load, if a custom_themes object doesn't exist, create one
    chrome.storage.sync.get('custom_themes', function(result) {
        if (!result.custom_themes || typeof result.custom_themes !== "object") {
            chrome.storage.sync.set({ custom_themes: [] }, function() {
                // console.log("Empty 'custom_themes' obj created");
                updateDropdown();
            });
        }
    });

    function updateDropdown() {
        // console.log('updateDropdown');
        chrome.storage.sync.get('custom_themes', function(result) {
            themeDropdown.innerHTML = ""; // clear dropdown
            const arr = result.custom_themes; // get themes array
            arr.forEach(theme => {
                const option = document.createElement("option");
                option.value = theme.name;
                option.text = theme.name;
                themeDropdown.appendChild(option);
            });
        });
    }

    updateDropdown();

    // Update current_theme in storage
    function updateCurrentTheme(enabled, theme) {
        if (enabled) {
            chrome.storage.sync.set({current_theme : theme}, function() {
                // console.log('updated current_theme:', theme);
            });
        } else {
            chrome.storage.sync.set({current_theme : null}, function() {
                // console.log('updated current_theme:', null);
            });
        }
    }

    // Darkmode toggle
    darkmodeButton.addEventListener('change', function() {    
        const isEnabled = darkmodeButton.checked;
        // console.log('darkmodeButton clicked');

        // themeButton on/off
        themeButton.disabled = isEnabled;

        // Send message to colorCanvas.js
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleTheme',
                enabled: isEnabled,
                theme: darkmode
            });
        });

        // update current_theme
        updateCurrentTheme(isEnabled, darkmode);
    });

    // Theme toggle
    themeButton.addEventListener('change', function() {
        const isEnabled = themeButton.checked;
        // console.log('themeButton clicked');

        if (themeDropdown.value !== undefined) {

            // darkmodeButton on/off
            darkmodeButton.disabled = isEnabled;

            chrome.storage.sync.get('custom_themes', function(result) {
                const arr = result.custom_themes;
                // get selected theme from dropdown 
                const theme = arr.find(theme => theme.name === themeDropdown.value);
                // console.log('selected theme:', theme);
                if (theme != undefined) {
                    // Send message to colorCanvas.js
                    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'toggleTheme',
                            enabled: isEnabled,
                            theme: theme
                        });
                    });

                    // update current_theme
                    updateCurrentTheme(isEnabled, theme);
                }
            });
        }
    });


    // Save new theme from popup inputs as the "current" theme
    saveButton.addEventListener('click', function() {
        // console.log('saveButton clicked');
        // Retrieve values from input fields
        const themeName = themeNameInput.value.trim();
        if (themeName !== "") {
            const newTheme = {
                name: themeName,
                cssVars: {
                    '--bg-0': bg0Input.value.trim(),
                    '--bg-1': bg1Input.value.trim(),
                    '--bg-2': bg2Input.value.trim(),
                    '--text-0': text0Input.value.trim(),
                    '--text-1': text1Input.value.trim(),
                    '--text-2': text2Input.value.trim(),
                    '--sidebar': sidebarInput.value.trim(),
                    '--links': linksInput.value.trim(),
                    '--hamburger': hamburgerInput.value.trim(),
                    '--invrt': invrtInput.checked
                }
            };

            // Save the new theme as the current theme in storage
            chrome.storage.sync.get('custom_themes', function(result) {
                let arr = result.custom_themes;
                arr.push(newTheme);
                chrome.storage.sync.set({ custom_themes: arr }, function() {
                    // console.log("Custom themes saved:", newTheme, '\n', arr);
                    updateDropdown();
                });
                // Set newly saved theme automatically...
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    themeButton.checked = true;
                    darkmodeButton.checked = false;
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'toggleTheme',
                        enabled: themeButton.checked,
                        theme: newTheme
                    });
                });

                // update current_theme
                updateCurrentTheme(true, newTheme);

                // darkmodeButton off
                darkmodeButton.disabled = themeButton.checked;

                // update dropdown
                // themeDropdown.value = themeName;
            });
        }
    });

    // Delete a custom theme
    deleteButton.addEventListener('click', function() {
        // console.log('deleteButton clicked');
        const to_delete = themeDropdown.value;
        // console.log('deleting:', to_delete);
        chrome.storage.sync.get('custom_themes', function(result) {
            let arr = result.custom_themes; // get themes array

            chrome.storage.sync.get('current_theme', function(result) {
                let current = result.current_theme; // get current theme
                if (current !== null && current.name === to_delete) {

                    // alert colorCanvas.js to update the theme
                    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                        themeButton.checked = false;
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'toggleTheme',
                            enabled: themeButton.checked
                        });
                    });

                    // set current_theme to null
                    updateCurrentTheme(false, null);
                }
                let index = arr.findIndex(theme => theme.name === to_delete);
                if (index === -1) return; // theme not found
                arr.splice(index, 1);
                chrome.storage.sync.set({ custom_themes: arr }, function() {
                    // console.log("Custom themes deleted:", to_delete, '\n', arr);
                    updateDropdown();
                });
            });
        });
    });

    // Edit a custom theme
    editButton.addEventListener('click', function() {
        // console.log('editButton clicked');
        // get selected theme from dropdown 
        const to_edit = themeDropdown.value;
        chrome.storage.sync.get('custom_themes', function(result) {
            let arr = result.custom_themes; // get themes array
            let index = arr.findIndex(theme => theme.name === to_edit);
            if (index === -1) return; // theme not found
            let theme = arr[index];
            // console.log('editing:', theme);

            // Set input fields to theme values
            const newTheme = {
                name: theme.name,
                cssVars: {
                    '--bg-0': bg0Input.value.trim(),
                    '--bg-1': bg1Input.value.trim(),
                    '--bg-2': bg2Input.value.trim(),
                    '--text-0': text0Input.value.trim(),
                    '--text-1': text1Input.value.trim(),
                    '--text-2': text2Input.value.trim(),
                    '--sidebar': sidebarInput.value.trim(),
                    '--links': linksInput.value.trim(),
                    '--hamburger': hamburgerInput.value.trim(),
                    '--invrt': invrtInput.checked
                }
            };

            // Replace the old theme with the new theme in the array
            arr[index] = newTheme;

            // alert colorCanvas.js to update the theme
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                themeButton.checked = true;
                darkmodeButton.checked = false;
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'toggleTheme',
                    enabled: themeButton.checked,
                    theme: newTheme
                });
            });

            // update current_theme
            updateCurrentTheme(true, newTheme);
            
            // darkmodeButton on/off
            darkmodeButton.disabled = themeButton.checked;
        });
    });

    // themeDropdown.addEventListener('change', function(event) {
    //     if (themeButton.checked) {
    //         updateCurrentTheme(true, themeDropdown.value);
    //         chrome.storage.sync.get('current_theme', function(result) {
    //             // console.log('current_theme:', result.current_theme);
    //             chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    //                 chrome.tabs.sendMessage(tabs[0].id, {
    //                     action: 'toggleTheme',
    //                     enabled: themeButton.checked,
    //                     theme: result.current_theme
    //                 });
    //             });
    //         });
    //     }
    // });
});
