// Call sayHello when content script loads (Not sure what this is but I will leave it)
sayHello();

// Start side menu for navigation links and standardized syllabus
activateSideMenu();


// Disabled calls

// Import and initialize each feature module
<<<<<<< HEAD
import { initializeTASchedule } from './features/ta_schedule.js';
import { initializeGradeCalculator } from './features/grade_calculator.js';
import { initializeThemeCustomizer } from './features/theme_customizer.js';
import { initializeSyllabusParser } from './features/pdf_syllabus_scraper.js';
=======
// import { initializeTASchedule } from './features/ta_schedule.js';
// import { initializeGradeCalculator } from './features/grade_calculator.js';
// import { initializeThemeCustomizer } from './features/theme_customizer.js';
// import { initializeSyllabusParser } from './features/syllabus_parser.js';
>>>>>>> d1ee49185b9a582802e85cc01b5fd797fec9d7ea

// // Call initialization functions for all features
// function initializeCanvasEnhancer() {
//     console.log("Canvas Enhancer Loaded");

//     initializeTASchedule();
//     initializeGradeCalculator();
//     initializeThemeCustomizer();
//     initializeSyllabusParser();
// }