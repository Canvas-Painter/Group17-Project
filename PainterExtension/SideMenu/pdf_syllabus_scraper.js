// features/pdf_syllabus_scraper.js

import { getAccessToken } from "./auth.js";
import { getDocument } from "pdfjs-dist";

/**
 * Main function to retrieve syllabus PDF from Canvas API, extract text, and find key details.
 */
export async function fetchAndParseSyllabus(courseId) {
    try {
        const pdfUrl = await getSyllabusPDF(courseId);
        if (!pdfUrl) {
            console.log("No syllabus PDF found.");
            return;
        }

        const syllabusText = await extractTextFromPDF(pdfUrl);
        const taHours = extractTAHours(syllabusText);
        const gradingPolicy = extractGradingPolicy(syllabusText);

        console.log("Extracted TA Hours:", taHours);
        console.log("Extracted Grading Policy:", gradingPolicy);

        return { taHours, gradingPolicy };
    } catch (error) {
        console.error("Error processing syllabus:", error);
    }
}

/**
 * Queries Canvas API to locate the syllabus PDF file in the course.
 */
async function getSyllabusPDF(courseId) {
    try {
        const response = await fetch(`https://canvas.instructure.com/api/v1/courses/${courseId}/files`, {
            headers: { "Authorization": `Bearer ${await getAccessToken()}` }
        });

        if (!response.ok) throw new Error("Failed to fetch course files");
        
        const files = await response.json();
        const syllabusFile = files.find(file => file.display_name.toLowerCase().includes("syllabus") && file.mime_class === "pdf");
        
        return syllabusFile ? syllabusFile.url : null;
    } catch (error) {
        console.error("Error retrieving syllabus PDF:", error);
        return null;
    }
}

/**
 * Extracts text content from a PDF file using pdf.js.
 */
async function extractTextFromPDF(pdfUrl) {
    try {
        const pdf = await getDocument(pdfUrl).promise;
        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            textContent.items.forEach(item => extractedText += item.str + " ");
        }

        return extractedText;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        return "";
    }
}

/**
 * Uses regex to extract TA office hours from the syllabus text.
 */
function extractTAHours(text) {
    let match = text.match(/TA Office Hours:([\s\S]*?)(?=\n\n|$)/i);
    return match ? match[1].trim() : "TA hours not found.";
}

/**
 * Uses regex to extract grading policy information from the syllabus text.
 */
function extractGradingPolicy(text) {
    let match = text.match(/Grading Policy:([\s\S]*?)(?=\n\n|$)/i);
    return match ? match[1].trim() : "Grading policy not found.";
}