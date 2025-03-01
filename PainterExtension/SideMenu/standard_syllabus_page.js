// Storage management functions
function loadCourseData(courseId) {
    return new Promise((resolve) => {
        const key = `syllabus_${courseId}`;
        chrome.storage.local.get(key, (result) => {
            const data = result[key];
            console.log('Loaded data:', key, data);
            
            // Check version and reset if not current
            if (!data || data.version !== '0.1.1') {
                const defaultData = getDefaultStructure();
                saveCourseData(courseId, defaultData);
                resolve(defaultData);
                return;
            }
            
            resolve(data);
        });
    });
}

function saveCourseData(courseId, data) {
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

function getDefaultStructure() {
    return {
        version: '0.1.1',
        categories: [
            {
                name: "Course Information",
                items: [
                    { type: "Course Title", text: "", editable: true },
                    { type: "Professor", text: "", editable: true },
                    { type: "Email", text: "", editable: true },
                    { type: "Office Hours", text: "", editable: true }
                ]
            },
            {
                name: "Course Policies",
                items: [
                    { type: "Attendance", text: "", editable: true },
                    { type: "Late Work", text: "", editable: true }
                ]
            },
            {
                name: "Grading",
                items: [
                    { type: "Assignments", text: "", editable: true },
                    { type: "Midterm", text: "", editable: true },
                    { type: "Final Project", text: "", editable: true },
                    { type: "Participation", text: "", editable: true }
                ]
            }
        ]
    };
}

// Add after storage functions
let isEditMode = false;
let backupData = null;
let data;
const main = document.getElementById('syllabus-categories');
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('courseId') || 'unknown';

function setupEditControls() {
    const controls = document.getElementById('edit-controls');
    const editBtn = document.querySelector('.edit-mode-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const doneBtn = document.querySelector('.done-btn');
    const addCategoryBtn = document.querySelector('.add-category-btn');
    
    // Get reference to the upload button from the DOM
    const uploadBtn = document.getElementById('uploadSyllabusBtn');

    editBtn.onclick = () => {
        isEditMode = true;
        backupData = JSON.parse(JSON.stringify(data));
        editBtn.style.display = 'none';
        cancelBtn.style.display = 'inline';
        doneBtn.style.display = 'inline';
        document.body.classList.add('edit-mode');
        document.querySelector('.add-category-btn').style.display = 'block';

        // Show Upload Button in Edit Mode
        if (uploadBtn) {
            uploadBtn.style.display = 'inline-block';
        }
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
        doneBtn.style.display = 'none';
        document.body.classList.remove('edit-mode');
        document.querySelector('.add-category-btn').style.display = 'none';

        // Hide Upload Button when done editing
        if (uploadBtn) {
            uploadBtn.style.display = 'none';
        }
    };

    addCategoryBtn.onclick = async () => {
        const newCategory = {
            name: 'New Category',
            items: []
        };
        data.categories.push(newCategory);
        const section = createSection(newCategory.name, [], newCategory, data);
        main.appendChild(section);
        await saveCourseData(new URLSearchParams(window.location.search).get('courseId'), data);
        // Trigger edit of the new category name
        section.querySelector('h2').click();
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId') || 'unknown';
    
    // Load saved data
    data = await loadCourseData(courseId);
    console.log('Loaded data structure:', data);

    // Setup edit controls
    setupEditControls();

    // Dynamically create sections
    data.categories.forEach(category => {
        const items = category.items.map(item => [item.type, item.text, item.editable]);
        const section = createSection(category.name, items, category, data);
        main.appendChild(section);
    });

    enableDragDrop(main, data);

    // Setup for file uploading
    const uploadBtn = document.getElementById("uploadSyllabusBtn");
    const fileInput = document.getElementById("syllabusFileInput");

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (file) {
              // 1) Read the PDF file as an ArrayBuffer
              const arrayBuffer = await file.arrayBuffer();
          
              // 2) Parse the PDF
              //    Note: You need a browser-friendly pdf.js or your own pdfToText function.
              //    If you have a function pdfToText(...) that returns text,
              //    you can pass arrayBuffer or a Uint8Array to it.
          
              try {
                const pdfText = await pdfToText(new Uint8Array(arrayBuffer));
                
                // 3) Build your data object
                const outputData = {
                  version: "0.1.1",
                  categories: [
                    {
                      name: "Course Information",
                      items: [
                        { type: "Course Title", text: extractCourseTitle(pdfText) },
                        { type: "Professor", text: extractProfessor(pdfText) },
                        // ...
                      ]
                    },
                    // ...
                  ]
                };
          
              } catch (err) {
                console.log("Error parsing:", err);
                console.log("Resorting to JSON");

                // 4) Save to chrome.storage with the correct key
                const reader = new FileReader()
                reader.readAsText(file)
                reader.onload = (event) => {
                    console.log(event.target.result)
                    console.log(JSON.parse(event.target.result))
                    saveCourseData(courseId, JSON.parse(event.target.result))
                    window.location.reload()
                }
              }
            }
          });
          
        
    }
});


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
        text: '',
        editable: true
    };
    
    category.items.push(newItem);
    const content = section.querySelector('.section-content');
    const row = createItemRow([newItem.type, newItem.text, newItem.editable], category, data);
    content.appendChild(row);
    
    await saveCourseData(new URLSearchParams(window.location.search).get('courseId'), data);
    // Trigger edit of the new item's name
    row.querySelector('.label').click();
}

function createItemRow([label, value, editable], category, data) {
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
    valueElem.onclick = () => isEditMode && editable && makeEditable(valueElem, label, category, data);
    
    const controls = document.createElement('div');
    controls.className = 'item-controls';
    controls.style.display = 'none';
    
    if (editable) {
        const dragBtn = document.createElement('button');
        dragBtn.className = 'standard-button drag-btn';
        dragBtn.textContent = '⋮⋮';
        dragBtn.title = 'Drag to reorder';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'standard-button delete-btn';
        deleteBtn.textContent = 'X';
        deleteBtn.onclick = () => isEditMode && deleteItem(row, category, label, data);
        
        controls.append(dragBtn, deleteBtn);
    }
    
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
    const input = document.createElement('input');
    input.value = oldType;
    input.className = 'edit-input';
    
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
    
    input.onblur = save;
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            save();
        }
    });
    
    labelElem.textContent = '';
    labelElem.appendChild(input);
    input.focus();
    input.select();
}

function makeEditable(element, field, category, data) {
    const currentValue = element.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.className = 'edit-input';

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

    input.addEventListener('blur', save);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            save();
        }
    });

    element.textContent = '';
    element.appendChild(input);
    input.focus();
    input.select();
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