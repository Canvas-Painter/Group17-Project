// process_syllabuses.js

// Import Node's file system promises API.
import fs from 'fs/promises';
// Import the getDocument function from pdfjs-dist.
import { getDocument } from "pdfjs-dist";

// Helper function to extract text from a local PDF file.
// It reads the file data and then processes each page.
async function extractTextFromLocalPDF(pdfPath) {
  try {
    // Read the PDF file as a binary Buffer.
    const fileData = await fs.readFile(pdfPath);
    // Load the PDF document by passing the file data.
    const loadingTask = getDocument({ data: fileData });
    const pdf = await loadingTask.promise;
    let extractedText = "";

    // Loop over each page of the PDF.
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      // Get text content from the page.
      const textContent = await page.getTextContent();
      textContent.items.forEach(item => {
        extractedText += item.str + " ";
      });
    }
    return extractedText;
  } catch (error) {
    console.error(`Error extracting text from ${pdfPath}:`, error);
    return "";
  }
}

// Uses regex to extract TA office hours from text.
function extractTAHours(text) {
  const match = text.match(/TA Office Hours:([\s\S]*?)(?=\n\n|$)/i);
  return match ? match[1].trim() : "TA hours not found.";
}

// Uses regex to extract the grading policy from text.
function extractGradingPolicy(text) {
  const match = text.match(/Grading Policy:([\s\S]*?)(?=\n\n|$)/i);
  return match ? match[1].trim() : "Grading policy not found.";
}

// Process a single syllabus: extract details and write them to an output text file.
async function processLocalSyllabus(pdfPath, outputPath) {
  // Extract the complete text from the PDF.
  const text = await extractTextFromLocalPDF(pdfPath);
  // Extract key details using our regex functions.
  const taHours = extractTAHours(text);
  const gradingPolicy = extractGradingPolicy(text);
  
  // Prepare a formatted output.
  const outputContent = 
`File: ${pdfPath}

TA Office Hours:
${taHours}

Grading Policy:
${gradingPolicy}
`;

  try {
    // Write the output to the specified text file.
    await fs.writeFile(outputPath, outputContent, 'utf-8');
    console.log(`Output written to ${outputPath}`);
  } catch (error) {
    console.error(`Error writing to ${outputPath}:`, error);
  }
}

// Main function to process all provided syllabuses.
async function main() {
  // Array of objects defining the input PDF and output TXT file paths. These are local stored syllabuses stored on Samuel's laptop
  const syllabuses = [
    { pdfPath: './Syllabus 341 Winter 2025_Section_010_V3.pdf', outputPath: './output_Syllabus341.txt' },
    { pdfPath: './cs381W25Syllabus.pdf', outputPath: './output_cs381W25.txt' },
    { pdfPath: './Syllabus CS340 Winter 2025.pdf', outputPath: './output_SyllabusCS340.txt' }
  ];
  
  // Process each syllabus sequentially.
  for (const syllabus of syllabuses) {
    await processLocalSyllabus(syllabus.pdfPath, syllabus.outputPath);
  }
}

// Run the main function.
main();
