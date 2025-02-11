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

function popOpen() {
    window.open(chrome.runtime.getURL('GradeBook/grades.html'), 'Gradebook', 'width=800, height=600, menubar=no, toolbar=no, location=no, status=no')
}

// Holds the found assignments
const assignments = []

// Sets up the code code by loading all the assignments
function setup() {
    // Checks that the page had a valid gradebook
    console.log("Checking for gradebook")
    const grade_div = document.getElementById("grade-summary-content")
    // If not the script shoudln't run
    if (!grade_div) {
        return
    }

    // Checks the sidebar is there
    const sidebar = document.getElementById("student-grades-right-content")
    // If not the script shoudln't run
    if (!sidebar) {
        return
    }

    console.log("Found gradebook")

    console.log("Reading data")
    // Goes through the table looking for the assignments
    for (const assignment of grade_div.getElementsByClassName("student_assignment")) {
        // If a class is hard coded it is not a valid assignment it
        //  it is something like the table bar or to the totals
        if (assignment.classList.contains("hard_coded")) {
            continue;
        }

        // Adds the assignment
        assignments.push(Assignment.fromHTML(assignment))
    }

    console.log("Read data")
}

document.addEventListener('DOMContentLoaded', () => {
    setup()
    popOpen();
})
