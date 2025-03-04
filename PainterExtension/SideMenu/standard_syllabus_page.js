// Storage management functions
function loadCourseData(courseId) {
    return new Promise(async (resolve) => {
        const key = `syllabus_${courseId}`;
        chrome.storage.local.get(key, async (result) => {
            const data = result[key];
            console.log('Loaded local data:', key, data);

            // If no data or wrong version, try getting from server first
            if (!data || data.version !== '0.1.1') {
                try {
                    // Try to get from server
                    const response = await fetch(`https://web.engr.oregonstate.edu/~ludwigo/cs362/api/syllabus-data.php?courseId=${courseId}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const serverData = await response.json();
                    
                    // Save server data locally and return it
                    await saveCourseData(courseId, serverData);
                    resolve(serverData);
                    return;
                } catch (error) {
                    console.error('Error fetching from server, using default:', error);
                    // Fall back to default structure if server fails
                    const defaultData = getDefaultStructure();
                    await saveCourseData(courseId, defaultData);
                    resolve(defaultData);
                    return;
                }
            }

            resolve(data);
        });
    });
}

// saves the data to local storage
function saveCourseData(courseId, data) {
    syllabusData = data;
    return new Promise((resolve, reject) => {
        const key = `syllabus_${courseId}`;
        const saveObj = { [key]: data };

        chrome.storage.local.set(saveObj, () => {
            if (chrome.runtime.lastError) {
                console.error('Save error:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
                return;
            }
            console.log('Saved data:', key, data);
            
            resolve(true);
        });
    });
}

// default structure for the syllabus
function getDefaultStructure() {
    return {
        version: '0.1.1',
        categories: [
            {
                name: "Course Information",
                items: [
                    { type: "Course Title", text: "" },
                    { type: "Professor", text: "" },
                    { type: "Email", text: "" },
                    { type: "Office Hours", text: "" }
                ]
            },
            {
                name: "Course Policies",
                items: [
                    { type: "Attendance", text: "" },
                    { type: "Late Work", text: "" }
                ]
            },
            {
                name: "Grading",
                items: [
                    { type: "Assignments", text: "" },
                    { type: "Midterm", text: "" },
                    { type: "Final Project", text: "" },
                    { type: "Participation", text: "" }
                ]
            }
        ]
    };
}

// show update button if data is different between local and server
function showUpdateButtonIfAppl() {
    const updateBtn = document.querySelector('.update-db-btn');
    updateBtn.style.display = isSyllabusDataEqual(syllabusData, window.serverSyllabusData) ? 'none' : 'inline';
}
function isSyllabusDataEqual(data1, data2) {
    console.log('Data1:', data1);
    console.log('Data2:', data2);
    
    // Handle null/undefined cases
    if (!data1 || !data2) return false;
    
    // Ensure both have required properties
    if (!data1.categories || !data2.categories) return false;

    try {
        // Normalize objects by sorting keys
        const normalize = (obj) => {
            if (Array.isArray(obj)) {
                return obj.map(normalize);
            }
            if (obj && typeof obj === 'object') {
                return Object.keys(obj).sort().reduce((result, key) => {
                    result[key] = normalize(obj[key]);
                    return result;
                }, {});
            }
            return obj;
        };

        const normalized1 = normalize(data1);
        const normalized2 = normalize(data2);
        
        return JSON.stringify(normalized1) === JSON.stringify(normalized2);
    } catch (e) {
        console.error('Comparison error:', e);
        return false;
    }
}

// Load initial data and compare with server data
async function loadInitialData(courseId) {
    try {
        
        // Fetch server data
        const response = await fetch(`https://web.engr.oregonstate.edu/~ludwigo/cs362/api/syllabus-data.php?courseId=${courseId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const serverData = await response.json();
        
        // Store server data for later comparison
        window.serverSyllabusData = serverData;
        console.log('Server data:', serverData);
        
        showUpdateButtonIfAppl();
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}


let isEditMode = false;
let backupData = null;
let syllabusData;
const main = document.getElementById('syllabus-categories');
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('courseId') || 'unknown';

// setup edit control functions and visibility
function setupEditControls() {
    const controls = document.getElementById('edit-controls');
    const editBtn = document.querySelector('.edit-mode-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const doneBtn = document.querySelector('.done-btn');
    const addCategoryBtn = document.querySelector('.add-category-btn');
    const uploadDbBtn = document.querySelector('.update-to-db-btn');
    const updateDbBtn = document.querySelector('.update-db-btn');

    // Get reference to the upload button from the DOM
    const uploadBtn = document.getElementById('uploadSyllabusBtn');

    console.log("🛠 Debugging Line 174: What is failing?");
    console.log("📄 Is pdfToText available?", typeof window.pdfToText);
    console.log("🔄 File Input Event Triggered", event);

    editBtn.onclick = () => {
        isEditMode = true;
        backupData = JSON.parse(JSON.stringify(syllabusData));
        editBtn.style.display = 'none';
        updateDbBtn.style.display = 'none';
        cancelBtn.style.display = 'inline';
        uploadDbBtn.style.display = 'inline';
        doneBtn.style.display = 'inline';
        uploadBtn.style.display = 'inline-block';
        document.body.classList.add('edit-mode');
        document.querySelector('.add-category-btn').style.display = 'block';
    };

    cancelBtn.onclick = async () => {
        await saveCourseData(courseId, backupData);
        window.location.reload();
    };

    doneBtn.onclick = () => {
        isEditMode = false;
        backupData = null;
        editBtn.style.display = 'inline';
        cancelBtn.style.display = 'none';
        uploadDbBtn.style.display = 'none';
        uploadBtn.style.display = 'none';
        doneBtn.style.display = 'none';
        document.body.classList.remove('edit-mode');
        document.querySelector('.add-category-btn').style.display = 'none';
        showUpdateButtonIfAppl();
    };

    addCategoryBtn.onclick = async () => {
        const newCategory = {
            name: 'New Category',
            items: []
        };
        syllabusData.categories.push(newCategory);
        const section = createSection(newCategory.name, [], newCategory, syllabusData);
        main.appendChild(section);
        await saveCourseData(new URLSearchParams(window.location.search).get('courseId'), syllabusData);
        // Trigger edit of the new category name
        section.querySelector('h2').click();
    };

    updateDbBtn.addEventListener('click', updateFromDatabase);
    uploadDbBtn.addEventListener('click', uploadToDatabase);
}

// display the syllabus data on the page
function displaySyllabusData(data) {
    main.innerHTML = '';

    data.categories.forEach(category => {
        const items = category.items.map(item => [item.type, item.text]);
        const section = createSection(category.name, items, category, data);
        main.appendChild(section);
    });

    enableDragDrop(main, data);
}

document.addEventListener('DOMContentLoaded', async () => {

    // Load saved data including server comparison
    syllabusData = await loadCourseData(courseId);
    console.log('Loaded data structure:', syllabusData);

    // Setup edit controls
    setupEditControls();

    displaySyllabusData(syllabusData);

    await loadInitialData(courseId);

    // Setup for file uploading
    const uploadBtn = document.getElementById("uploadSyllabusBtn");
    const fileInput = document.getElementById("syllabusFileInput");

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", async function(event) {
            var file = event.target.files[0];
            if (!file) return;
        
            var reader = new FileReader();
        
            // If JSON file, process it normally
            if (file.name.endsWith(".json")) {
                reader.readAsText(file);
                reader.onload = function(event) {
                    try {
                        var jsonData = JSON.parse(event.target.result);
                        saveCourseData(courseId, jsonData);
                        window.location.reload();
                    } catch (err) {
                        console.error("Error parsing JSON:", err);
                    }
                };
            } 
            
            // If PDF file, process it using pdf.js
            else if (file.name.endsWith(".pdf")) {
                reader.readAsArrayBuffer(file);
                reader.onload = async function(event) {
                    var arrayBuffer = event.target.result;
                    var pdfUint8Array = new Uint8Array(arrayBuffer);
        
                    try {
                        var pdfText = await pdfToText(pdfUint8Array);  // Call function from pdf_parser.js
                        
                        var parsedData = {
                            version: "0.1.1",
                            categories: [
                                {
                                    name: "Course Information",
                                    items: [
                                        { type: "Course Title", text: extractCourseTitle(pdfText) },
                                        { type: "Professor", text: extractProfessor(pdfText) },
                                        { type: "Email", text: extractEmail(pdfText) },
                                        { type: "Office Hours", text: extractTAOfficeHours(pdfText) }
                                    ]
                                },
                                {
                                    name: "Course Policies",
                                    items: [
                                        { type: "Attendance", text: extractAttendance(pdfText) },
                                        { type: "Late Work", text: extractLateWork(pdfText) }
                                    ]
                                },
                                {
                                    name: "Grading",
                                    items: [
                                        { type: "Assignments", text: extractGradingAssignments(pdfText) },
                                        { type: "Quizzes", text: extractQuizzes(pdfText) },
                                        { type: "Midterm", text: extractMidterm(pdfText) },
                                        { type: "Final Project", text: extractFinalProject(pdfText) },
                                        { type: "Final Exam", text: extractFinalExam(pdfText) },
                                        { type: "Participation", text: extractParticipation(pdfText) },
                                        { type: "Grading Policy", text: extractGradingPolicy(pdfText) }
                                    ]
                                }
                            ]
                        };
        
                        // Save extracted syllabus data
                        await saveCourseData(courseId, parsedData);
                        window.location.reload();
                    } catch (err) {
                        console.error("Error processing PDF:", err);
                        alert("Could not parse PDF syllabus. Please check the format.");
                    }
                };
            } 
            
            else {
                alert("Unsupported file format. Please upload a JSON or PDF file.");
            }
        });
        


    }
});

// Modify the updateFromDatabase function to properly update reference data
async function updateFromDatabase() {
    // Save old data as backup
    backupData = syllabusData;
    console.log('Backup data:', backupData);
    
    // Then update local data and display
    syllabusData = structuredClone(window.serverSyllabusData);
    await saveCourseData(courseId, syllabusData);
    displaySyllabusData(syllabusData);

    // Switch to edit mode if User wants to revert
    isEditMode = true;
    document.querySelector('.edit-mode-btn').style.display = 'none';
    document.querySelector('.cancel-btn').style.display = 'inline';
    document.querySelector('.done-btn').style.display = 'inline';
    document.querySelector('.update-db-btn').style.display = 'none';

    // After updating from database, update the server data reference
    showUpdateButtonIfAppl();
}

function createCategorySection(category) {
    const section = document.createElement('section');
    section.innerHTML = `
        <div class="category-header">
            <h2>${category.title}</h2>
        </div>
        <div class="section-content">
            ${category.items.map(item => `
                <div class="info-row">
                    <div class="label">${item.label}</div>
                    <div class="value">${item.value}</div>
                </div>
            `).join('')}
        </div>
    `;
    return section;
}

function createSection(title, items, category, data) {
    const section = document.createElement('section');

    const heading = document.createElement('h2');
    heading.textContent = title;
    heading.onclick = () => isEditMode && editCategoryName(heading, category, data);
    heading.className = 'category-header';

    const controls = createCategoryControls(section, category, data);

    const content = document.createElement('div');
    content.className = 'category-content';

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'section-content';

    items.forEach(item => {
        itemsContainer.appendChild(createItemRow(item, category, data));
    });

    content.appendChild(itemsContainer);
    section.append(heading, controls, content);
    return section;
}

function createCategoryControls(section, category, data) {
    const controls = document.createElement('div');
    controls.className = 'category-controls';
    controls.style.display = 'none';

    const dragBtn = document.createElement('button');
    dragBtn.textContent = '⋮⋮';
    dragBtn.className = 'standard-button drag-btn';
    dragBtn.title = 'Drag to reorder';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'X';
    deleteBtn.className = 'standard-button delete-btn';
    deleteBtn.onclick = () => deleteCategory(section, category, data);

    const addItemBtn = document.createElement('button');
    addItemBtn.textContent = '+ Add Item';
    addItemBtn.className = 'standard-button add-item-btn';
    addItemBtn.onclick = () => addNewItem(section, category, data);

    controls.append(dragBtn, deleteBtn, addItemBtn);
    return controls;
}

async function editCategoryName(heading, category, data) {
    const input = document.createElement('input');
    input.value = category.name;
    input.className = 'edit-input';

    const save = async () => {
        const newName = input.value.trim();
        if (newName && newName !== category.name) {
            category.name = newName;
            heading.textContent = newName;
            const courseId = new URLSearchParams(window.location.search).get('courseId');
            await saveCourseData(courseId, data);
        } else {
            heading.textContent = category.name;
        }
        input.remove();
    };

    input.onblur = save;
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            save();
        }
    });

    heading.textContent = '';
    heading.appendChild(input);
    input.focus();
    input.select();
}

async function deleteCategory(section, category, data) {
    const index = data.categories.indexOf(category);
    data.categories.splice(index, 1);
    section.remove();
    await saveCourseData(new URLSearchParams(window.location.search).get('courseId'), data);
}

async function addNewItem(section, category, data) {
    const newItem = {
        type: 'New Item',
        text: ''
    };

    category.items.push(newItem);
    const content = section.querySelector('.section-content');
    const row = createItemRow([newItem.type, newItem.text], category, data);
    content.appendChild(row);

    await saveCourseData(new URLSearchParams(window.location.search).get('courseId'), data);
    // Trigger edit of the new item's name
    row.querySelector('.label').click();
}

function createItemRow([label, value], category, data) {
    const row = document.createElement('div');
    row.className = 'info-row';
    row.dataset.field = label;

    const labelElem = document.createElement('div');
    labelElem.className = 'label editable-text';
    labelElem.textContent = label;
    labelElem.onclick = () => isEditMode && editItemName(labelElem, category, label, data);

    const valueElem = document.createElement('div');
    valueElem.className = 'value editable-text';
    valueElem.textContent = value;
    valueElem.onclick = () => isEditMode && makeEditable(valueElem, label, category, data);
    
    const controls = document.createElement('div');
    controls.className = 'item-controls';
    controls.style.display = 'none';
    
    const dragBtn = document.createElement('button');
    dragBtn.className = 'standard-button drag-btn';
    dragBtn.textContent = '⋮⋮';
    dragBtn.title = 'Drag to reorder';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'standard-button delete-btn';
    deleteBtn.textContent = 'X';
    deleteBtn.onclick = () => isEditMode && deleteItem(row, category, label, data);
    
    controls.append(dragBtn, deleteBtn);
    row.append(controls, labelElem, valueElem);
    return row;
}

async function deleteItem(row, category, itemType, data) {
    const index = category.items.findIndex(item => item.type === itemType);
    category.items.splice(index, 1);
    row.remove();
    await saveCourseData(new URLSearchParams(window.location.search).get('courseId'), data);
}

async function editItemName(labelElem, category, oldType, data) {
    // Prevent multiple inputs
    if (labelElem.querySelector('.edit-input')) {
        return;
    }

    const input = document.createElement('input');
    input.value = oldType;
    input.className = 'edit-input';

    // Stop click propagation
    input.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    const save = async () => {
        const newType = input.value.trim();
        if (newType && newType !== oldType) {
            const item = category.items.find(item => item.type === oldType);
            if (item) {
                item.type = newType;
                labelElem.textContent = newType;
                labelElem.parentElement.dataset.field = newType;
                const courseId = new URLSearchParams(window.location.search).get('courseId');
                await saveCourseData(courseId, data);
            }
        } else {
            labelElem.textContent = oldType;
        }
        input.remove();
    };

    input.addEventListener('blur', save);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            save();
        }
    });

    labelElem.textContent = '';
    labelElem.appendChild(input);
    
    // Set focus without selection
    requestAnimationFrame(() => {
        input.focus();
    });
}

function makeEditable(element, field, category, data) {
    // Prevent multiple inputs
    if (element.querySelector('.edit-input')) {
        return;
    }

    const currentValue = element.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.className = 'edit-input';

    // Stop click propagation
    input.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    const save = async () => {
        const newValue = input.value.trim();
        if (newValue === currentValue) {
            element.textContent = currentValue;
            return;
        }

        try {
            const courseId = new URLSearchParams(window.location.search).get('courseId');

            // Update the text in the nested structure
            category.items.forEach(item => {
                if (item.type === field) {
                    item.text = newValue;
                }
            });

            await saveCourseData(courseId, data);
            element.textContent = newValue;
        } catch (error) {
            console.error('Save error:', error);
            element.textContent = currentValue;
            alert('Failed to save changes. Please try again.');
        }
    };

    input.addEventListener('blur', () => {
        save();
        input.remove();
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            save();
            input.remove();
        }
    });

    element.textContent = '';
    element.appendChild(input);
    
    // Set focus without selection
    requestAnimationFrame(() => {
        input.focus();
    });
}


function enableDragDrop(main, data) {
    let draggedItem = null;
    let draggedCategory = null;
    let originalCategory = null;

    // Enable category dragging
    main.querySelectorAll('section').forEach(section => {
        const dragBtn = section.querySelector('.category-controls .drag-btn');
        section.draggable = true;

        dragBtn.addEventListener('mousedown', (e) => {
            if (!isEditMode) return;
            section.draggedAsCategory = true;
            e.stopPropagation();
        });

        section.addEventListener('dragstart', (e) => {
            if (!isEditMode || !section.draggedAsCategory) {
                e.preventDefault();
                return;
            }
            draggedCategory = section;
            section.classList.add('dragging');
        });

        section.addEventListener('dragend', () => {
            section.classList.remove('dragging');
            section.draggedAsCategory = false;
        });
    });

    // Enable item dragging
    main.querySelectorAll('.info-row').forEach(row => {
        const dragBtn = row.querySelector('.drag-btn');
        if (!dragBtn) return;

        row.draggable = true;

        dragBtn.addEventListener('mousedown', (e) => {
            if (!isEditMode) return;
            row.draggedAsItem = true;
            originalCategory = row.closest('.section-content');
            e.stopPropagation();
        });

        row.addEventListener('dragstart', (e) => {
            if (!isEditMode || !row.draggedAsItem) {
                e.preventDefault();
                return;
            }
            draggedItem = row;
            requestAnimationFrame(() => {
                row.classList.add('dragging');
                row.style.opacity = '0.5';
            });
            e.stopPropagation();
        });

        row.addEventListener('dragend', () => {
            row.classList.remove('dragging');
            row.style.opacity = '';
            row.draggedAsItem = false;
            draggedItem = null;
            originalCategory = null;
        });
    });

    // Handle category drops
    main.addEventListener('dragover', (e) => {
        if (!isEditMode || !draggedCategory) return;
        e.preventDefault();
        const afterElement = getDragAfterElement(main, e.clientY, 'section', draggedCategory);
        if (afterElement) {
            main.insertBefore(draggedCategory, afterElement);
        } else {
            main.insertBefore(draggedCategory, main.querySelector('.add-category-btn'));
        }
        updateCategoryOrder(data);
    });

    // Handle item drops within sections
    main.querySelectorAll('.section-content').forEach(content => {
        content.addEventListener('dragover', (e) => {
            if (!isEditMode || !draggedItem) return;
            e.preventDefault();
            e.stopPropagation();

            // Only allow drops within the same category as original
            if (content !== originalCategory) return;

            const afterElement = getDragAfterElement(content, e.clientY, '.info-row', draggedItem);

            if (draggedItem !== afterElement) {
                if (afterElement) {
                    content.insertBefore(draggedItem, afterElement);
                } else {
                    content.appendChild(draggedItem);
                }
            }
        });

        content.addEventListener('drop', async (e) => {
            if (!isEditMode || !draggedItem) return;
            e.preventDefault();

            // Only handle drops within the same category
            if (content !== originalCategory) return;

            // Update the data structure and save
            await updateItemOrder(data);
        });

        content.addEventListener('dragenter', (e) => {
            if (!isEditMode || !draggedItem) return;
            e.preventDefault();
        });
    });
}

function getDragAfterElement(container, y, selector, draggedElement) {
    const draggableElements = [...container.querySelectorAll(`${selector}:not(.dragging)`)]
        .filter(element => element !== draggedElement);

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function updateCategoryOrder(data) {
    const sections = document.querySelectorAll('section');
    const newOrder = [];

    sections.forEach(section => {
        const categoryName = section.querySelector('h2').textContent;
        const category = data.categories.find(c => c.name === categoryName);
        if (category) {
            newOrder.push(category);
        }
    });

    data.categories = newOrder;
    await saveCourseData(new URLSearchParams(window.location.search).get('courseId'), data);
}

async function updateItemOrder(data) {
    const sections = document.querySelectorAll('section');
    let updated = false;

    sections.forEach(section => {
        const categoryName = section.querySelector('h2').textContent;
        const category = data.categories.find(c => c.name === categoryName);
        if (category) {
            const rows = section.querySelectorAll('.info-row');
            const newItems = [];

            rows.forEach(row => {
                const itemType = row.dataset.field;
                const item = category.items.find(i => i.type === itemType);
                if (item) {
                    newItems.push(item);
                    updated = true;
                }
            });

            if (newItems.length > 0) {
                category.items = newItems;
            }
        }
    });

    if (updated) {
        await saveCourseData(new URLSearchParams(window.location.search).get('courseId'), data);
    }
}

// Add this new function
async function uploadToDatabase() {
    try {
        const response = await fetch('https://web.engr.oregonstate.edu/~ludwigo/cs362/api/syllabus-data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                courseId: courseId,
                data: syllabusData
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Update server reference data
        window.serverSyllabusData = structuredClone(syllabusData);
        
        // Exit edit mode (similar to done button)
        isEditMode = false;
        backupData = null;
        document.querySelector('.edit-mode-btn').style.display = 'inline';
        document.querySelector('.cancel-btn').style.display = 'none';
        document.querySelector('.update-to-db-btn').style.display = 'none';
        document.getElementById('uploadSyllabusBtn').style.display = 'none';
        document.querySelector('.done-btn').style.display = 'none';
        document.body.classList.remove('edit-mode');
        document.querySelector('.add-category-btn').style.display = 'none';
        showUpdateButtonIfAppl();

    } catch (error) {
        console.error('Error uploading to database:', error);
        alert('Failed to upload changes. Please try again.');
    }
}