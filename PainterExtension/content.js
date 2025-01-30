// Call sayHello when content script loads (Not sure what this is but I will leave it)
sayHello();
waitForNavMenu();

// content.js

// Import and initialize each feature module
import { initializeTASchedule } from './features/ta_schedule.js';
import { initializeGradeCalculator } from './features/grade_calculator.js';
import { initializeThemeCustomizer } from './features/theme_customizer.js';
import { initializeSyllabusParser } from './features/syllabus_parser.js';

// Call initialization functions for all features
function initializeCanvasEnhancer() {
    console.log("Canvas Enhancer Loaded");

    initializeTASchedule();
    initializeGradeCalculator();
    initializeThemeCustomizer();
    initializeSyllabusParser();
}

// Wait for the page to load before running the scripts (Kai)
document.addEventListener("DOMContentLoaded", initializeCanvasEnhancer);
