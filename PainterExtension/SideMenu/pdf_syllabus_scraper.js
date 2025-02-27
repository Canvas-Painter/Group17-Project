// pdf_parser.js

<<<<<<< Updated upstream
// Please keep in mind this only works locally for now, I will be imrpoving it throughout the day making sure it works with the side menu functions

const fs = require('fs');
const path = require('path');
const pdfjsLib = require('../node_modules/pdfjs-dist/legacy/build/pdf.js');
const { getDocument } = pdfjsLib;

// Array of syllabus PDF file paths
const syllabusFiles = [
  "C:\\Users\\Sam\\Downloads\\Syllabus 341 Winter 2025_Section_010_V2.pdf",
  "C:\\Users\\Sam\\Downloads\\cs381W25Syllabus.pdf",
  "C:\\Users\\Sam\\Downloads\\Syllabus CS340 Winter 2025 (1).pdf"
];

/**
 * Extracts the full text from a PDF using pdf.js.
 *
 * @param {Uint8Array|ArrayBuffer} data - The PDF file data.
 * @returns {Promise<string>} A promise that resolves to the full extracted text from the PDF.
 * 
 * This function loads the PDF document from the input data, then iterates through each page,
 * extracts the text content, concatenates text from each block into a single string, and returns
 * the complete text from all pages.
 */
async function pdfToText(data) {
  const loadingTask = getDocument(data);
  const pdf = await loadingTask.promise;
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    let pageText = "";
    let lastBlock = null;
    const blocks = textContent.items;
    
    for (let k = 0; k < blocks.length; k++) {
      const block = blocks[k];
      if (lastBlock !== null && lastBlock.str[lastBlock.str.length - 1] !== ' ') {
        if (block.transform[4] < lastBlock.transform[4]) {
          pageText += "\r\n";
        } else if (
          lastBlock.transform[5] !== block.transform[5] &&
          !/^\s?[a-zA-Z]$/.test(lastBlock.str)
        ) {
          pageText += ' ';
        }
      }
      pageText += block.str;
      lastBlock = block;
=======
// Import helper function to get an access token for Canvas API authentication.
import { getAccessToken } from "./auth.js";
// Import pdf.js function to load and work with PDF documents.
import { getDocument } from "pdfjs-dist";

/**
 * Main function that retrieves the syllabus PDF from the Canvas API,
 * extracts its text content, and parses key details such as TA hours and grading policy.
 *
 * @param {string} courseId - The Canvas course ID.
 * @returns {object|undefined} - Returns an object containing extracted TA hours and grading policy,
 *                               or undefined if no syllabus PDF is found.
 */
export async function fetchAndParseSyllabus(courseId) {
    try {
        // Retrieve the URL of the syllabus PDF using the course ID.
        const pdfUrl = await getSyllabusPDF(courseId);
        if (!pdfUrl) {
            console.log("No syllabus PDF found.");
            return;
        }

        // Extract all text from the retrieved PDF.
        const syllabusText = await extractTextFromPDF(pdfUrl);
        // Use regex to extract TA office hours from the text.
        const taHours = extractTAHours(syllabusText);
        // Use regex to extract the grading policy from the text.
        const gradingPolicy = extractGradingPolicy(syllabusText);

        // Log the extracted details for debugging or further processing.
        console.log("Extracted TA Hours:", taHours);
        console.log("Extracted Grading Policy:", gradingPolicy);

        // Return an object containing the key extracted details.
        return { taHours, gradingPolicy };
    } catch (error) {
        // Log any error encountered during the process.
        console.error("Error processing syllabus:", error);
>>>>>>> Stashed changes
    }
    fullText += pageText + "\n\n";
  }
  return fullText;
}

/**
<<<<<<< Updated upstream
 * Extracts TA office hours from the given text.
 *
 * @param {string} text - The full extracted text from the PDF.
 * @returns {string} The extracted TA office hours if found, otherwise a message "TA office hours not found."
 * 
 * This function searches for the marker "Office Hours:" in the text. If not found, it attempts to find "TA Info:".
 * Once a marker is found, it extracts and returns the text on the same line following the marker.
 */
function extractTAOfficeHours(text) {
  const marker = "Office Hours:";
  let idx = text.indexOf(marker);
  if (idx === -1) {
    const altMarker = "TA Info:";
    idx = text.indexOf(altMarker);
    if (idx === -1) {
      return "TA office hours not found.";
    } else {
      let sub = text.substring(idx + altMarker.length);
      const lineEnd = sub.indexOf("\n");
      return sub.substring(0, lineEnd !== -1 ? lineEnd : undefined).trim();
=======
 * Queries the Canvas API to locate the syllabus PDF file for a given course.
 *
 * @param {string} courseId - The Canvas course ID.
 * @returns {string|null} - Returns the URL of the syllabus PDF if found, otherwise null.
 */
async function getSyllabusPDF(courseId) {
    try {
        // Construct the API endpoint URL and fetch course files.
        const response = await fetch(`https://canvas.instructure.com/api/v1/courses/${courseId}/files`, {
            headers: { "Authorization": `Bearer ${await getAccessToken()}` }
        });

        // If the response is not successful, throw an error.
        if (!response.ok) throw new Error("Failed to fetch course files");
        
        // Parse the JSON response which contains a list of file objects.
        const files = await response.json();
        // Find the file with "syllabus" in its name and of PDF type.
        const syllabusFile = files.find(file => file.display_name.toLowerCase().includes("syllabus") && file.mime_class === "pdf");
        
        // Return the URL of the syllabus file if found; otherwise, return null.
        return syllabusFile ? syllabusFile.url : null;
    } catch (error) {
        // Log errors related to fetching the syllabus PDF.
        console.error("Error retrieving syllabus PDF:", error);
        return null;
>>>>>>> Stashed changes
    }
  }
  let sub = text.substring(idx + marker.length);
  const lineEnd = sub.indexOf("\n");
  return sub.substring(0, lineEnd !== -1 ? lineEnd : undefined).trim();
}

/**
<<<<<<< Updated upstream
 * Extracts grading policy information from the given text.
 *
 * @param {string} text - The full extracted text from the PDF.
 * @returns {string} The extracted grading policy information, including grade weights and letter scale,
 *                   or a message "Grading policy not found." if not detected.
 * 
 * This function first checks for the "Grade Weighting" section. It then extracts a chunk of text from that marker,
 * filtering for lines that contain "%" (assumed to be the weight lines). It also searches for a "grade letter" marker
 * (case-insensitive) to locate letter grade scale lines using a regular expression. If no such marker is found, it tries
 * the "Grading Scale" marker instead. The function returns a block combining both weight lines and letter scale lines.
 */
function extractGradingPolicy(text) {
  let idx = text.indexOf("Grade Weighting");
  if (idx !== -1) {
    // Extract a chunk from "Grade Weighting"
    let chunk = text.substring(idx, idx + 1000);
    
    // Extract weighting lines (lines that contain "%")
    const weightingLines = chunk
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.includes("%"));
    
    // Search for "grade letter" marker (case-insensitive) to locate letter grade scale lines
    let letterIdx = text.search(/grade letter/i);
    let letterScaleLines = [];
    if (letterIdx !== -1) {
      // Take a 500-character chunk from the "grade letter" marker
      let letterChunk = text.substring(letterIdx, letterIdx + 500);
      // Regex to match lines starting with a letter grade (A-F, optionally with '+' or '-') followed by whitespace and a number
      const scaleRegex = /^[A-F][+-]?\s+\d+/gm;
      let match;
      while ((match = scaleRegex.exec(letterChunk)) !== null) {
        letterScaleLines.push(match[0].trim());
      }
    }
    // If no "grade letter" marker found or no matches, try to extract from a "Grading Scale" block instead.
    if (letterScaleLines.length === 0) {
      let idxScale = text.indexOf("Grading Scale", idx);
      if (idxScale !== -1) {
        let scaleChunk = text.substring(idxScale, idxScale + 500);
        const scaleRegex = /^[A-F][+-]?\s+\d+/gm;
        let match;
        while ((match = scaleRegex.exec(scaleChunk)) !== null) {
          letterScaleLines.push(match[0].trim());
        }
      }
    }
    
    if (weightingLines.length === 0 && letterScaleLines.length === 0) {
      return "Grading policy not found.";
    }
    
    let output = "";
    if (weightingLines.length > 0) {
      output += weightingLines.join("\n");
    }
    if (letterScaleLines.length > 0) {
      output += "\n\nGrading Scale:\n" + letterScaleLines.join("\n");
    }
    return output;
  }
  
  // Fallback: try other markers if "Grade Weighting" is not found.
  const markers = ["Graded Work", "Grading Policies:", "Grading Policy:", "Grading:"];
  for (const marker of markers) {
    idx = text.indexOf(marker);
    if (idx !== -1) {
      let sub = text.substring(idx + marker.length);
      let endIdx = sub.search(/\r?\n\r?\n/);
      if (endIdx === -1) endIdx = sub.length;
      let result = sub.substring(0, endIdx).trim();
      if (result.length > 0) return result;
    }
  }
  return "Grading policy not found.";
=======
 * Extracts the entire text content from a PDF document using pdf.js.
 *
 * @param {string} pdfUrl - The URL of the PDF document.
 * @returns {string} - The concatenated text extracted from all pages of the PDF.
 */
async function extractTextFromPDF(pdfUrl) {
    try {
        // Load the PDF document asynchronously.
        const pdf = await getDocument(pdfUrl).promise;
        let extractedText = "";

        // Iterate over each page in the PDF.
        for (let i = 1; i <= pdf.numPages; i++) {
            // Get the current page.
            const page = await pdf.getPage(i);
            // Extract text content from the page.
            const textContent = await page.getTextContent();
            // Append each text item to the overall extracted text.
            textContent.items.forEach(item => extractedText += item.str + " ");
        }

        // Return the complete extracted text.
        return extractedText;
    } catch (error) {
        // Log any error encountered during text extraction.
        console.error("Error extracting text from PDF:", error);
        return "";
    }
}

/**
 * Uses a regular expression to extract TA office hours information from the syllabus text.
 *
 * @param {string} text - The complete text extracted from the syllabus PDF.
 * @returns {string} - The extracted TA office hours or a default message if not found.
 */
function extractTAHours(text) {
    // Regex looks for "TA Office Hours:" followed by any characters until a double newline or the end.
    let match = text.match(/TA Office Hours:([\s\S]*?)(?=\n\n|$)/i);
    return match ? match[1].trim() : "TA hours not found.";
}

/**
 * Uses a regular expression to extract grading policy information from the syllabus text.
 *
 * @param {string} text - The complete text extracted from the syllabus PDF.
 * @returns {string} - The extracted grading policy or a default message if not found.
 */
function extractGradingPolicy(text) {
    // Regex looks for "Grading Policy:" followed by any characters until a double newline or the end.
    let match = text.match(/Grading Policy:([\s\S]*?)(?=\n\n|$)/i);
    return match ? match[1].trim() : "Grading policy not found.";
>>>>>>> Stashed changes
}

/**
 * Processes a single PDF syllabus file.
 *
 * @param {string} filePath - The full path to the PDF file.
 * @returns {Promise<void>} A promise that resolves when processing is complete.
 * 
 * This function reads the PDF file from the given file path, extracts its full text using pdfToText,
 * then extracts TA office hours and grading policy information from that text using the appropriate functions.
 * Finally, it writes the resulting output to a text file named after the original PDF.
 */
async function processSyllabus(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const uint8ArrayData = new Uint8Array(dataBuffer);
    const fullText = await pdfToText(uint8ArrayData);
    
    const taOfficeHours = extractTAOfficeHours(fullText);
    const gradingPolicy = extractGradingPolicy(fullText);
    
    const output = `TA Office Hours: ${taOfficeHours}\n\nGrading Policy:\n${gradingPolicy}`;
    
    const baseName = path.basename(filePath, path.extname(filePath));
    const outputFileName = `${baseName}_output.txt`;
    fs.writeFileSync(outputFileName, output, "utf8");
    console.log(`Output for "${baseName}" written to ${outputFileName}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Processes all syllabus PDF files listed in the syllabusFiles array.
 *
 * @returns {Promise<void>} A promise that resolves when all files have been processed.
 * 
 * This function iterates through each file path in the syllabusFiles array and calls processSyllabus
 * for each one sequentially.
 */
async function processAllSyllabi() {
  for (const filePath of syllabusFiles) {
    await processSyllabus(filePath);
  }
}

// processAllSyllabi();
