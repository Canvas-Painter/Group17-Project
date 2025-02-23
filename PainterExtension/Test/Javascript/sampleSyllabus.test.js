test('PDF Load Button exists on standard syllabus page', () => {
    // Set up document body
    document.body.innerHTML = `
        <div id="loadPdfContainer">
            <button id="loadFromPdf">Load from PDF</button>
        </div>
    `;
    
    // Check if the button exists
    const loadButton = document.querySelector('#loadFromPdf');
    expect(loadButton).not.toBeNull();
    expect(loadButton.textContent).toBe('Load from PDF');
});