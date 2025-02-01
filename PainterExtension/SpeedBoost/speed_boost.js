// Sets the innerHTML of an element 'elem' to 'html' and causes all the scripts to run
// 'elem' the element to set the innerHTML of
// 'html' the html to set innerHTML to
function setInnerHTMLWithJS(elm, html) {
    // Sets it
    elm.innerHTML = html

    // Goes through all the JS replacing it which causes it to run
    Array.from(elm.querySelectorAll("script")).forEach((oldScriptEl) => {
        // Creates a script
        const newScriptEl = document.createElement("script");

        // Copies the attributes over
        Array.from(oldScriptEl.attributes).forEach( attr => {
            newScriptEl.setAttribute(attr.name, attr.value)
        })

        // Creates the script text and assigns it
        const scriptText = document.createTextNode(oldScriptEl.innerHTML)
        newScriptEl.appendChild(scriptText)

        // Replaces the script causing it to run
        // This can cause the uncatchable error that the script doesn't have permission to run
        // To fix it the scripts hash must be included in the manifest
        oldScriptEl.parentNode.replaceChild(newScriptEl, oldScriptEl)
    })
}

(async () => {
    // Get a specifc canvas page and parses the fetch'd data
    const page = await (await fetch('/courses/1987844/announcements')).text()
    const parser = new DOMParser()
    const html = parser.parseFromString(page, 'text/html')

    // Waits until ctrl + m is pressed
    addEventListener('keydown', (event) => {
        if (event.key == 'm' && event.ctrlKey) {
            // Changes the title of the page to the title
            history.pushState("", "Title", "/courses/1987844/announcements")

            // Sets the HTML to the newly fetch'd stuff
            setInnerHTMLWithJS(document.head, html.head.innerHTML)
            setInnerHTMLWithJS(document.body, html.body.innerHTML)
        }
    })
})()