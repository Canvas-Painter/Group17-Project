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
    // TODO add support for check/x marks
    static fromHTML(elem) {
        const title = elem.getElementsByClassName("title")[0]
        const gradeHolder = elem.getElementsByClassName("score_holder")[0].lastElementChild
        const maxHolder = elem.getElementsByClassName("tooltip")[0].children[1]

        return new Assignment(
            title.getElementsByTagName("a")[0],
            parseFloat(gradeHolder.getElementsByClassName("original_score")[0].textContent.replace(',', '')),
            // Slice will remove the slash at the front
            maxHolder ? parseFloat(maxHolder.textContent.slice(1).replace(',', '')) : NaN,
            title.getElementsByClassName("context")[0].textContent
        )
    }
}

class Points {
    constructor(current, max) {
        this.current = current
        this.max = max
    }

    static parse(text) {
        const texts = text.split('/')
        return new Points(parseFloat(texts[0].replace(',', '')), parseFloat(texts[1].replace(',', '')))
    }
}

// Intented to open window with info currently adds info to the sidebar
function popOpen(assignments, weights, totals) {
    // Creates a category map by grouping up the assignments
    const categories = new Map()
    assignments.forEach(assignment => {
        const category = assignment.type

        // If no group made then make one
        if (!categories.has(category)) {
            categories.set(category, [])
        }

        // Add the assignment
        categories.get(category).push(assignment)
    })

    // Temporary side document
    const doc = document.getElementById("student-grades-right-content")

    // Creates the elements to add to the window
    const elements = []
    categories.forEach((value, key) => {
        const scores = []
        // Maps each group to a set of data points that stats can be calculated from
        value.forEach(assignment => {
            if (assignment.max != 0 && !isNaN(assignment.max) && !isNaN(assignment.grade)) {
                scores.push(assignment.grade / assignment.max)
            }
        })

        // Creates the element
        const elem = document.createElement('div')
        elem.textContent = `${key}: Mean: ${mean(scores).toFixed(2)}, StdDev: ${stdDev(scores).toFixed(2)}`
        elements.push(elem)
    })

    // Addes the elements
    elements.forEach(value =>
        doc.appendChild(value)
    )

    fetch(chrome.runtime.getURL('GradeBook/test_assignment.html'))
        .then(response => response.text())
        .then(text => {
            // If innerHTML is used on the original thing then canvas freezes up for some reason
            const body = document.createElement('tbody')
            body.innerHTML = text
            document.getElementById('grade-summary-content').getElementsByTagName('tbody')[0].appendChild(body.firstChild);

            // Get the important elements
            const points = document.getElementById('test-points')
            const grade = document.getElementById('test-grade')
            const output = document.getElementById('test-output')
            // Declare the update function
            let update_fun

            // If the grades are weighted things are different
            if (weights) {
                // Create the dropdwon and populate it
                const dropdown = document.getElementById('test-dropdown')
                for (const [name, points] of weights) {
                    const opt = document.createElement('option')
                    opt.value = name
                    opt.textContent = name
                    dropdown.appendChild(opt)
                }

                // Calulate the total grade as a percent
                let total_grade = 0
                // To handle 0 / 0 situations
                let total_percent = 0
                for (const [name, points] of totals) {
                    if (points.max == 0) { continue }

                    const weight = weights.get(name)
                    total_grade += (points.current / points.max) * weight
                    total_percent += weight
                }

                total_grade /= total_percent

                update_fun = () => {
                    // Parse the elements and check for nulls
                    const max = parseFloat(points.value)
                    if (isNaN(max)) { output.textContent = ''; return }

                    const target = parseFloat(grade.value) / 100
                    if (isNaN(target)) { output.textContent = ''; return }

                    const category = dropdown.value
                    const category_points = totals.get(category)
                    const category_weight = weights.get(category)
                    // category_weight could be 0 so an explicit check is needed
                    if (!category_points || category_weight === undefined) { output.textContent = ''; return }

                    // Find the total grade assuming that the relevant category is percent
                    let grade_without
                    if (category_points.max != 0) {
                        grade_without = total_grade - (category_weight * (category_points.current / category_points.max))
                    } else {
                        grade_without = total_grade * (1 - category_weight)
                    }

                    // Find what percent in the relevant categary would create the target grade
                    const needed = (target - grade_without) / category_weight
                    // Calulate the total points needed to bring the category to that value (like below)
                    const value = (needed * (category_points.max + max)) - category_points.current
                    if (0 <= value && value <= max) {
                        output.textContent = value.toFixed(2)
                    } else {
                        output.textContent = value.toFixed(2) + ' Likely impossible'
                    }
                }

                // Add the update function
                dropdown.onchange = update_fun
            } else {
                document.getElementById('test-dropdown').remove()

                // Calculate the total points possible and the total points collected
                let total_current = 0
                let total_max = 0
                for (const [name, points] of totals) {
                    total_current += points.current
                    total_max += points.max
                }

                update_fun = () => {
                    // Try to parse the elements with graceful failures
                    const max = parseFloat(points.value)
                    if (isNaN(max)) { output.textContent = ''; return }

                    const target = parseFloat(grade.value) / 100
                    if (isNaN(target)) { output.textContent = ''; return }

                    // Calculate the value needed to bring the percentage up to the target
                    const value = (target * (total_max + max)) - total_current
                    if (0 <= value && value <= max) {
                        output.textContent = value.toFixed(2)
                    } else {
                        output.textContent = value.toFixed(2) + ' Likely impossible'
                    }
                }
            }


            // Add the update function
            points.onchange = update_fun
            grade.onchange = update_fun
        })
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

    console.log("Reading grades")
    // Goes through the table looking for the assignments and totals
    let totals = new Map()
    for (const assignment of grade_div.getElementsByClassName("student_assignment")) {
        // If a class is hard coded it is not a valid assignment it
        //  it is something like the table bar or to the totals
        if (assignment.classList.contains("hard_coded")) {
            if (assignment.classList.contains("group_total")) {
                totals.set(
                    assignment.getElementsByClassName("title")[0].textContent.trim(),
                    Points.parse(assignment.getElementsByClassName("points_possible")[0].textContent)
                )
            }

            continue
        }

        // Adds the assignment
        assignments.push(Assignment.fromHTML(assignment))
    }

    console.log("Reading weights")
    let weights = new Map();
    const summary = sidebar.getElementsByClassName("summary")[0]
    if (summary) {
        const entries = summary.getElementsByTagName("tr");
        // The the first is the labels and last is the total so can be ignored
        for (let i = 1; i < entries.length - 1; i++) {
            const text = entries[i].textContent.split('\n')
            weights.set(text[1].trim(), parseFloat(text[2].trim()) / 100)
        }
    } else {
        weights = null
        console.log("No weights")
    }

    console.log("Done")

    return [assignments, weights, totals]
}

// Sets up and runs if set up
document.addEventListener('DOMContentLoaded', async () => {
    // This allows canvas to load things
    // This could be improved by dynamic checking
    await new Promise(res => setTimeout(res, 1000));

    const parsed = setup()
    if (parsed) {
        popOpen(parsed[0], parsed[1], parsed[2])
    }
})
