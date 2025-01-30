// features/grade_calculator.js

export function initializeGradeCalculator() {
    console.log("Grade Calculator Feature Loaded");
    
    // Check if user is on the grades page
    if (window.location.pathname.includes("grades")) {
        injectGradeCalculator();
    }
}

function injectGradeCalculator() {
    // Placeholder: UI element for grade calculation
    let calculatorDiv = document.createElement("div");
    calculatorDiv.innerHTML = `
        <div style="position:fixed; bottom:50px; right:10px; background:white; padding:10px; border:1px solid black;">
            <label>Desired Grade: <input type="number" id="desiredGrade" min="0" max="100"></label>
            <button id="calculateGrade">Calculate</button>
            <p id="gradeResult"></p>
        </div>
    `;
    
    document.body.appendChild(calculatorDiv);
    
    document.getElementById("calculateGrade").addEventListener("click", calculateRequiredGrade);
}

function calculateRequiredGrade() {
    let desiredGrade = parseFloat(document.getElementById("desiredGrade").value);
    if (isNaN(desiredGrade) || desiredGrade < 0 || desiredGrade > 100) {
        document.getElementById("gradeResult").innerText = "Enter a valid grade (0-100).";
        return;
    }
    
    // Placeholder logic: Assume final exam is 30% of grade
    let requiredExamGrade = (desiredGrade - 70) / 0.3; 
    document.getElementById("gradeResult").innerText = `You need a ${requiredExamGrade.toFixed(2)}% on the final.`;
}
