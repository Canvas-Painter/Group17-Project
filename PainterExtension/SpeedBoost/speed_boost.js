
function setInnerHTML(elm, html) {
    elm.innerHTML = html;

    Array.from(elm.querySelectorAll("script"))
        .forEach( oldScriptEl => {
        const newScriptEl = document.createElement("script");

        Array.from(oldScriptEl.attributes).forEach( attr => {
            newScriptEl.setAttribute(attr.name, attr.value)
        });

        const scriptText = document.createTextNode(oldScriptEl.innerHTML);
        newScriptEl.appendChild(scriptText);

        oldScriptEl.parentNode.replaceChild(newScriptEl, oldScriptEl);
    });
}

(async () => {
    const page = await (await fetch('/courses/1987844/announcements')).text()
    const parser = new DOMParser()
    const html = parser.parseFromString(page, 'text/html')

    addEventListener('keydown', (event) => {
        if (event.key == 'm' && event.ctrlKey) {
            history.pushState("object or string", "Title", "/courses/1987844/announcements")
            console.log(html.head)
            html.head.innerHTML += '\n<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'">'
            console.log(html.head)
            setInnerHTML(document.head, html.head.innerHTML)
            setInnerHTML(document.body, html.body.innerHTML)
        }
    })
})()
