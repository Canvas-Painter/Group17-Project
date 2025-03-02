document.addEventListener('DOMContentLoaded', () => {
    let planner = document.getElementById('dashboard-planner')

    if (!planner) { return }

    function update() {
        for (const element of planner.getElementsByClassName('PlannerItem-styles__due')) {
            const textChild = element.firstChild.firstChild

            if (textChild.textContent.startsWith('Due: ') && textChild.textContent != 'Due: 11:59 PM' && !textChild.hasAttribute('checked')) {
                textChild.setAttribute('checked', '')

                const fontSize = parseFloat(window.getComputedStyle(textChild, null).getPropertyValue('font-size'))
                textChild.setAttribute('style', `font-size: ${(fontSize * 2) + 'px'}`)
            }
        }
    }

    const observer = new MutationObserver((records, observer) => {
        // This is pretty lazy
        update()
    })

    observer.observe(planner, { attributes: false, childList: true, subtree: true })

    update()
})
