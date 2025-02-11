// Holds the data associated with an assigment
//  entry on the gradebook table
class Assignment {
    // A default contrusctor for a data class
    constructor(title, grade, max, type) {
        this.title = title
        this.grade = grade
        this.max = max
        this.type = type
    }

    // Gets the relevant data from a valid table entry (not hard_coded) in the
    //  student_assignment table
    static fromHTML(elem) {
        const gradeNodes = elem.getElementsByClassName("grade")[0].childNodes
        const title = elem.getElementsByClassName("title")[0]

        return new Assignment(
            title.getElementsByTagName("a")[0],

            gradeNodes.length == 5 ?
                parseInt(gradeNodes[4].textContent)
                : null,

            parseInt(elem.getElementsByClassName("tooltip")[0].children[1]
                .textContent.slice(1)),

            title.getElementsByClassName("context")[0].textContent
        )
    }
}

function popOpen(assignments) {
    const categories = new Map()
    assignments.forEach(assignment => {
        const category = assignment.type

        if (!categories.has(category)) {
            categories.set(category, [])
        }

        categories.get(category).push(assignment)
    })

    // Doesn't modify the window opened, but everything else appears correct
    // window.open(chrome.runtime.getURL('GradeBook/grades.html'), 'Gradebook', 'width=800, height=600, menubar=no, toolbar=no, location=no, status=no').document

    // Temporary side document
    const doc = document.getElementById("student-grades-right-content")

    const elements = []
    categories.forEach((value, key) => {
        const scores = []
        value.forEach(assignment => {
            if (assignment.max != 0 && assignment.grade != null) {
                scores.push(assignment.grade / assignment.max)
            }
        })

        console.log(value)
        const elem = /*doc*/document.createElement('div')
        elem.textContent = `${key}: Mean: ${mean(scores)}, StdDev: ${stdDev(scores)}`
        console.log(elem.textContent)
        elements.push(elem)
    })

    console.log(elements)

    elements.forEach(value =>
        doc/*.body*/.appendChild(value)
    )
}

// Sets up the code code by loading all the assignments
function setup() {
    // Holds the found assignments
    const assignments = []

    // Checks that the page had a valid gradebook
    console.log("Checking for gradebook")
    const grade_div = document.getElementById("grade-summary-content")
    // If not the script shoudln't run
    if (!grade_div) {
        return null
    }

    // Checks the sidebar is there
    const sidebar = document.getElementById("student-grades-right-content")
    // If not the script shoudln't run
    if (!sidebar) {
        return null
    }

    console.log("Found gradebook")

    console.log("Reading data")
    // Goes through the table looking for the assignments
    for (const assignment of grade_div.getElementsByClassName("student_assignment")) {
        // If a class is hard coded it is not a valid assignment it
        //  it is something like the table bar or to the totals
        if (assignment.classList.contains("hard_coded")) {
            continue
        }

        // Adds the assignment
        assignments.push(Assignment.fromHTML(assignment))
    }

    console.log("Read data")

    return assignments
}

document.addEventListener('DOMContentLoaded', () => {
    const assignments = setup()
    if (assignments) {
        popOpen(assignments)
    }
})
