// Storage management functions
function loadCourseData(courseId) {
    return new Promise((resolve) => {
        const key = `syllabus_${courseId}`;
        chrome.storage.local.get(key, (result) => {
            const data = result[key];
            console.log('Loaded data:', key, data);
            resolve(data || {});
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

// Debug function - you can remove this later
function debugStorage() {
    chrome.storage.local.get(null, (result) => {
        console.log('All storage data:', result);
    });
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
    const savedData = await loadCourseData(courseId);
    console.log('Loaded saved data for course:', courseId, savedData);
    
    const defaultData = {
        'Course Title': '',
        'Professor': '',
        'Email': '',
        'Office Hours': '',
        'Attendance': '',
        'Late Work': '',
        'Assignments': '',
        'Midterm': '',
        'Final Project': '',
        'Participation': ''
    };

    // Merge saved data with blank defaults
    const data = Object.keys(defaultData).reduce((acc, key) => {
        acc[key] = savedData[key] !== undefined ? savedData[key] : defaultData[key];
        return acc;
    }, {});

    // Remove loading message
    loadingMsg.remove();

    const main = document.createElement('main');
    main.className = 'syllabus-content';

    const header = createSection('Course Information', [
        ['Course ID', courseId, false],
        ['Course Title', data['Course Title'], true],
        ['Professor', data['Professor'], true],
        ['Email', data['Email'], true],
        ['Office Hours', data['Office Hours'], true]
    ]);

    const policies = createSection('Course Policies', [
        ['Attendance', data['Attendance'], true],
        ['Late Work', data['Late Work'], true]
    ]);

    const grading = createSection('Grading', [
        ['Assignments', data['Assignments'], true],
        ['Midterm', data['Midterm'], true],
        ['Final Project', data['Final Project'], true],
        ['Participation', data['Participation'], true]
    ]);

    [header, policies, grading].forEach(section => main.appendChild(section));
    document.body.appendChild(main);
});

function createSection(title, items) {
    const section = document.createElement('section');
    
    const heading = document.createElement('h2');
    heading.textContent = title;
    section.appendChild(heading);

    const content = document.createElement('div');
    content.className = 'section-content';

    items.forEach(([label, value, editable]) => {
        const row = document.createElement('div');
        row.className = 'info-row';
        row.dataset.field = label;
        
        const labelElem = document.createElement('div');
        labelElem.className = 'label';
        labelElem.textContent = label;
        
        const valueElem = document.createElement('div');
        valueElem.className = 'value';
        valueElem.textContent = value;

        if (editable) {
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = '✎';
            editBtn.onclick = () => makeEditable(valueElem, label);
            row.appendChild(editBtn);
        }
        
        row.appendChild(labelElem);
        row.appendChild(valueElem);
        content.appendChild(row);
    });

    section.appendChild(content);
    return section;
}

function makeEditable(element, field) {
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
            const savedData = await loadCourseData(courseId);
            const updatedData = { ...savedData, [field]: newValue };
            
            await saveCourseData(courseId, updatedData);
            element.textContent = newValue;
            
            // Debug - verify save
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

function getCurrentTerm() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    if (month >= 8 && month <= 11) return `Fall ${year}`;
    if (month >= 0 && month <= 2) return `Winter ${year}`;
    if (month >= 3 && month <= 5) return `Spring ${year}`;
    return `Summer ${year}`;
}
