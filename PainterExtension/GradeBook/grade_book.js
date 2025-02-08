function setup() {
    console.log("Checking for gradebook")
    const grade_div = document.getElementById("grade-summary-content")
    if (!grade_div) { return }

    const sidebar = document.getElementById("student-grades-right-content")
    if (!sidebar) { return }
    console.log("Found gradebook")

    console.log("Reading data")
    for (const assignment of grade_div.getElementsByClassName("student_assignment")) {
        if (assignment.classList.contains("hard_coded")) {
            continue;
        }

        console.log(assignment.getElementsByClassName("title")[0].getElementsByTagName("a")[0])
    }
    console.log("Read data")
}

document.addEventListener('DOMContentLoaded', () => {
    setup()
})
