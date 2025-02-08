class Assignment {
    constructor(title, grade, max) {
        this.title = title
        this.grade = grade
        this.max = max
    }

    static fromHTML(elem) {
        const gradeNodes = elem.getElementsByClassName("grade")[0].childNodes

        return new Assignment(
            elem.getElementsByClassName("title")[0]
                .getElementsByTagName("a")[0],

            gradeNodes.length == 5 ?
                parseInt(gradeNodes[4].textContent)
                : null,

            parseInt(elem.getElementsByClassName("tooltip")[0].children[1]
                .textContent.slice(1))
        )
    }
}

const assignments = []

function setup() {
    console.log("Checking for gradebook")
    const grade_div = document.getElementById("grade-summary-content")
    if (!grade_div) {
        return
    }

    const sidebar = document.getElementById("student-grades-right-content")
    if (!sidebar) {
        return
    }

    console.log("Found gradebook")

    console.log("Reading data")
    for (const assignment of grade_div.getElementsByClassName("student_assignment")) {
        if (assignment.classList.contains("hard_coded")) {
            continue;
        }

        assignments.push(Assignment.fromHTML(assignment))
    }

    console.log("Read data")
}

document.addEventListener('DOMContentLoaded', () => {
    setup()
})
