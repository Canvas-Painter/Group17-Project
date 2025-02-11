// Storage management functions
function loadCourseData(courseId) {
    return new Promise((resolve) => {
        const key = `syllabus_${courseId}`;
        chrome.storage.local.get(key, (result) => {
            const data = result[key];
            console.log('Loaded data:', key, data);
            
            // Check version and reset if not current
            if (!data || data.version !== '0.1') {
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
        version: '0.1',
        categories: [
            {
                name: "Course Information",
                items: [
                    { type: "Course ID", text: "", editable: false },
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

// Debug function - you can remove this later
function debugStorage() {
    chrome.storage.local.get(null, (result) => {
        console.log('All storage data:', result);
    });
}

// Add after storage functions
let isEditMode = false;
let backupData = null;

function createEditControls() {
    const controls = document.createElement('div');
    controls.className = 'edit-mode-controls';
    
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-mode-btn';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'cancel-btn';
    cancelBtn.style.display = 'none';
    
    const doneBtn = document.createElement('button');
    doneBtn.textContent = 'Done';
    doneBtn.className = 'done-btn';
    doneBtn.style.display = 'none';
    
    controls.append(editBtn, cancelBtn, doneBtn);
    return { controls, editBtn, cancelBtn, doneBtn };
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId') || 'unknown';
    
    // Show loading state
    const loadingMsg = document.createElement('div');
    loadingMsg.textContent = 'Loading syllabus data...';
    document.body.appendChild(loadingMsg);
    
    // Debug current storage
    debugStorage();
    
    // Load saved data
    const data = await loadCourseData(courseId);
    console.log('Loaded data structure:', data);

    // Remove loading message
    loadingMsg.remove();

    const main = document.createElement('main');
    main.className = 'syllabus-content';

    // Add edit controls
    const { controls, editBtn, cancelBtn, doneBtn } = createEditControls();
    main.appendChild(controls);

    editBtn.onclick = () => {
        isEditMode = true;
        backupData = JSON.parse(JSON.stringify(data));
        editBtn.style.display = 'none';
        cancelBtn.style.display = 'inline';
        doneBtn.style.display = 'inline';
        document.body.classList.add('edit-mode');
    };

    cancelBtn.onclick = async () => {
        if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
            await saveCourseData(courseId, backupData);
            window.location.reload();
        }
    };

    doneBtn.onclick = () => {
        isEditMode = false;
        backupData = null;
        editBtn.style.display = 'inline';
        cancelBtn.style.display = 'none';
        doneBtn.style.display = 'none';
        document.body.classList.remove('edit-mode');
    };

    // Dynamically create sections from categories
    data.categories.forEach(category => {
        const items = category.items.map(item => {
            // Special handling for Course ID
            if (item.type === 'Course ID') {
                return [item.type, courseId, item.editable];
            }
            return [item.type, item.text, item.editable];
        });
        
        const section = createSection(category.name, items, category, data);
        main.appendChild(section);
    });

    addNewCategoryButton(main, data);
    document.body.appendChild(main);
});

function createSection(title, items, category, data) {
    const section = document.createElement('section');
    
    const heading = document.createElement('h2');
    heading.textContent = title;
    heading.onclick = () => isEditMode && editCategoryName(heading, category, data);
    
    const controls = createCategoryControls(section, category, data);
    controls.style.display = 'none';
    
    const content = document.createElement('div');
    content.className = 'section-content';
    
    items.forEach(item => {
        content.appendChild(createItemRow(item, category, data));
    });
    
    section.append(heading, controls, content);
    return section;
}

function createCategoryControls(section, category, data) {
    const controls = document.createElement('div');
    controls.className = 'category-controls';
    controls.style.display = 'none';
    
    const editNameBtn = document.createElement('button');
    editNameBtn.textContent = '✎';
    editNameBtn.className = 'category-edit-btn';
    editNameBtn.onclick = () => editCategoryName(section.querySelector('h2'), category, data);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '╳';
    deleteBtn.className = 'category-delete-btn';
    deleteBtn.onclick = () => deleteCategory(section, category, data);
    
    const addItemBtn = document.createElement('button');
    addItemBtn.textContent = '+ Add Item';
    addItemBtn.className = 'add-item-btn';
    addItemBtn.onclick = () => addNewItem(section, category, data);
    
    controls.append(editNameBtn, deleteBtn, addItemBtn);
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
    labelElem.className = 'label';
    labelElem.textContent = label;
    labelElem.onclick = () => isEditMode && editItemName(labelElem, category, label, data);
    
    const valueElem = document.createElement('div');
    valueElem.className = 'value';
    valueElem.textContent = value;
    
    const controls = document.createElement('div');
    controls.className = 'item-controls';
    controls.style.display = 'none';
    
    if (editable) {
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = '✎';
        editBtn.onclick = () => isEditMode && makeEditable(valueElem, label, category, data);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '╳';
        deleteBtn.onclick = () => isEditMode && deleteItem(row, category, label, data);
        
        controls.append(editBtn, deleteBtn);
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
            const data = await loadCourseData(courseId);
            
            // Update the text in the nested structure
            category.items.forEach(item => {
                if (item.type === field) {
                    item.text = newValue;
                }
            });
            
            await saveCourseData(courseId, data);
            element.textContent = newValue;
            debugStorage();
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

function addNewCategoryButton(main, data) {
    const btn = document.createElement('button');
    btn.textContent = '+ Add Category';
    btn.className = 'add-category-btn';
    btn.onclick = async () => {
        const newCategory = {
            name: 'New Category',
            items: []
        };
        data.categories.push(newCategory);
        const section = createSection(newCategory.name, [], newCategory, data);
        main.insertBefore(section, btn);
        await saveCourseData(new URLSearchParams(window.location.search).get('courseId'), data);
        // Trigger edit of the new category name
        section.querySelector('h2').click();
    };
    main.appendChild(btn);
}

function getCurrentTerm() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    if (month >= 8 && month <= 11) return `Fall ${year}`;
    if (month >= 0 && month <= 2) return `Winter ${year}`;
    if (month >= 3 && month <= 5) return `Spring ${year}`;
    return `Summer ${year}`;
}

// Add CSS rules
const style = document.createElement('style');
style.textContent = `
    .edit-mode-controls {
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 1000;
    }
    
    .edit-mode .item-controls,
    .edit-mode .category-controls {
        display: block !important;
    }
    
    .edit-mode .label:hover,
    .edit-mode h2:hover {
        background: #f0f0f0;
        cursor: pointer;
    }
`;
document.head.appendChild(style);
