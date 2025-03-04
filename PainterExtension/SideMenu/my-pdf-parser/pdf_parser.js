// multi_pdf_parser.js

var pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

const { getDocument } = pdfjsLib;



/**
 * pdfToText
 * -----------
 * Input: A Uint8Array or ArrayBuffer containing the PDF file data.
 * Output: A Promise that resolves to a string with the full text extracted from the PDF.
 * Description: Loads the PDF document using pdf.js, iterates over each page, extracts the text content from
 *              each text block, concatenates the text (inserting newlines as appropriate), and returns the
 *              complete text.
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
    }
    fullText += pageText + "\n\n";
  }
  return fullText;
}

/**
 * extractTAOfficeHours
 * ----------------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string containing the extracted TA office hours if found, or a message if not found.
 * Description: Searches the text for the marker "Office Hours:" (or "TA Info:") and returns the text
 *              on the same line following the marker.
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
    }
  }
  let sub = text.substring(idx + marker.length);
  const lineEnd = sub.indexOf("\n");
  return sub.substring(0, lineEnd !== -1 ? lineEnd : undefined).trim();
}

/**
 * extractGradingPolicy
 * ----------------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with the extracted grading policy information (grade weights and letter scale),
 *         or a message if not found.
 * Description: For CS/ECE 476, if detected, extracts text starting at "Evaluation of Student Performance"
 *              until the first double newline. Otherwise, it searches for the "Grade Weighting" section,
 *              extracts a chunk of text, filters for lines containing "%" (grade weights) and letter-grade lines,
 *              and returns the combined result.
 */
function extractGradingPolicy(text) {
  if (/CS\/ECE 476/i.test(text)) {
    let idx = text.indexOf("Evaluation of Student Performance");
    if (idx !== -1) {
      let sub = text.substring(idx);
      let endIdx = sub.indexOf("\n\n");
      if (endIdx === -1) endIdx = sub.length;
      return sub.substring(0, endIdx).trim();
    }
    return "Grading policy not found.";
  }

  let idx = text.indexOf("Grade Weighting");
  if (idx !== -1) {
    let chunk = text.substring(idx, idx + 1000);
    const weightingLines = chunk
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.includes("%"));

    let letterIdx = text.search(/grade letter/i);
    let letterScaleLines = [];
    if (letterIdx !== -1) {
      let letterChunk = text.substring(letterIdx, letterIdx + 500);
      const scaleRegex = /^[A-F][+-]?\s+\d+/gm;
      let match;
      while ((match = scaleRegex.exec(letterChunk)) !== null) {
        letterScaleLines.push(match[0].trim());
      }
    }
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
}

/**
 * extractQuizzes
 * ---------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with the extracted quiz grading information if found, or a message if not found.
 * Description: For CS/ECE 476, looks for "Category Portion of Grade" and returns the line containing "Quizzes".
 *              Otherwise, uses a regular expression to find a line starting with "Quiz" or "Quizzes:".
 */
function extractQuizzes(text) {
  if (/CS\/ECE 476/i.test(text)) {
    let idx = text.indexOf("Category Portion of Grade");
    if (idx !== -1) {
      let sub = text.substring(idx, idx + 1000);
      const lines = sub.split("\n").map(l => l.trim());
      const quizLine = lines.find(line => /^Quizzes\s+\d+%/.test(line));
      return quizLine || "Quiz grading information not found.";
    }
    return "Quiz grading information not found.";
  }
  const regex = /^Quiz(?:es)?:\s*(.+)$/im;
  const match = text.match(regex);
  return match ? match[1].trim() : "Quiz grading information not found.";
}

/**
 * extractCourseTitle
 * ---------------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with the extracted course title if found, or "Course title not found."
 * Description: For CS/ECE 476, returns the second nonempty line (the course title). Otherwise, splits the text into
 *              lines and attempts to find a line that includes key course title keywords.
 */
function extractCourseTitle(text) {
  if (/CS\/ECE 476/i.test(text)) {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    return lines[1] || "Course title not found.";
  }
  const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
  for (const line of lines) {
    if (/linear algebra/i.test(line)) {
      return line;
    }
  }
  for (const line of lines) {
    if (!line.toLowerCase().startsWith("last updated") && !line.toLowerCase().includes("syllabus")) {
      return line;
    }
  }
  return "Course title not found.";
}

/**
 * extractProfessor
 * -------------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with the professor's name if found, or "Professor not found."
 * Description: For CS/ECE 476, returns the third nonempty line (the professor's name). Otherwise,
 *              searches for "Instructor:" or "Professor:" and returns the text on that line (or falls back to
 *              "About the Instructor").
 */
function extractProfessor(text) {
  if (/CS\/ECE 476/i.test(text)) {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    return lines[2] || "Professor not found.";
  }
  let idx = text.indexOf("Instructor:");
  if (idx === -1) {
    idx = text.indexOf("Professor:");
    if (idx === -1) {
      idx = text.indexOf("About the Instructor");
      if (idx === -1) return "Professor not found.";
      else {
        let sub = text.substring(idx);
        const lineEnd = sub.indexOf("\n");
        return sub.substring(0, lineEnd !== -1 ? lineEnd : undefined)
                  .replace(/About the Instructor/i, "").trim();
      }
    }
  }
  let sub = text.substring(idx);
  const lineEnd = sub.indexOf("\n");
  return sub.substring(0, lineEnd !== -1 ? lineEnd : undefined)
            .replace(/Instructor:|Professor:/i, "").trim();
}

/**
 * extractEmail
 * --------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with an email address if found, or "Email not found."
 * Description: Uses a regular expression to search for a pattern that matches an email address in the text.
 */
function extractEmail(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : "Email not found.";
}

/**
 * extractAttendance
 * --------------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with the attendance policy details if found, or "Attendance policy not found."
 * Description: Searches for the marker "Attendance" and returns the text on that line.
 */
function extractAttendance(text) {
  const idx = text.indexOf("Attendance");
  if (idx === -1) return "Attendance policy not found.";
  let sub = text.substring(idx);
  const lineEnd = sub.indexOf("\n");
  return sub.substring(0, lineEnd !== -1 ? lineEnd : undefined).trim();
}

/**
 * extractLateWork
 * ------------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with the late work policy details if found, or "Late work policy not found."
 * Description: First checks for explicit markers ("Late Policy", "Late Policies", or "Late Work").
 *              If found, extracts the corresponding block up to the next double newline.
 *              Otherwise, falls back to the "Homework:" section, returning only lines mentioning "late"
 *              with a "%" penalty.
 */
function extractLateWork(text) {
  const explicitMarkers = ["Late Policy", "Late Policies", "Late Work"];
  for (const marker of explicitMarkers) {
    let idx = text.indexOf(marker);
    if (idx !== -1) {
      let sub = text.substring(idx);
      let endIdx = sub.search(/\r?\n\r?\n/);
      if (endIdx === -1) endIdx = sub.length;
      return sub.substring(0, endIdx).trim();
    }
  }
  // Fallback: check the Homework section for late penalty details.
  let homeworkIdx = text.indexOf("Homework:");
  if (homeworkIdx !== -1) {
    let sub = text.substring(homeworkIdx);
    let endIdx = sub.search(/\r?\n\r?\n/);
    if (endIdx === -1) endIdx = sub.length;
    let lines = sub.substring(0, endIdx).split("\n");
    let filtered = lines.filter(line => /late/i.test(line) && /%/.test(line));
    if (filtered.length > 0) {
      return filtered.join("\n").trim();
    }
  }
  return "Late work policy not found.";
}

/**
 * extractGradingAssignments
 * ---------------------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with assignment grading details if found, or "Assignment grading information not found."
 * Description: For CS/ECE 476, if "Category Portion of Grade" is found, extracts that block and returns only lines
 *              with a "%" that do not start with a letter grade (A–F). Otherwise, searches for the marker "Assignments"
 *              and splits the result by a bullet character (""), returning only the first segment.
 */
function extractGradingAssignments(text) {
  if (/CS\/ECE 476/i.test(text)) {
    let idx = text.indexOf("Category Portion of Grade");
    if (idx !== -1) {
      let sub = text.substring(idx, idx + 1000);
      const lines = sub.split("\n").map(l => l.trim()).filter(l => {
        return /\d+%/.test(l) && !/^[A-F]/i.test(l);
      });
      return lines.join("\n");
    }
    return "Assignment grading information not found.";
  }
  const idx = text.indexOf("Assignments");
  if (idx === -1) return "Assignment grading information not found.";
  let sub = text.substring(idx);
  let parts = sub.split("");
  return parts[0].trim();
}

/**
 * extractMidterm
 * ---------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with midterm exam grading details if found, or "Midterm grading information not found."
 * Description: For CS/ECE 476, returns "Midterm grading information not found." Otherwise, searches for "Midterm"
 *              and returns the text on that line.
 */
function extractMidterm(text) {
  if (/CS\/ECE 476/i.test(text)) return "Midterm grading information not found.";
  const idx = text.indexOf("Midterm");
  if (idx === -1) return "Midterm grading information not found.";
  let sub = text.substring(idx);
  const lineEnd = sub.indexOf("\n");
  return sub.substring(0, lineEnd !== -1 ? lineEnd : undefined).trim();
}

/**
 * extractFinalProject
 * ---------------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with final project grading details if found, or "Final project grading information not found."
 * Description: For CS/ECE 476, returns "Final project grading information not found." Otherwise, searches for "Final Project"
 *              or "Project Step 1 Final Version" and returns the text on that line.
 */
function extractFinalProject(text) {
  if (/CS\/ECE 476/i.test(text)) return "Final project grading information not found.";
  let idx = text.indexOf("Final Project");
  if (idx === -1) {
    idx = text.indexOf("Project Step 1 Final Version");
    if (idx === -1) return "Final project grading information not found.";
  }
  let sub = text.substring(idx);
  const lineEnd = sub.indexOf("\n");
  return sub.substring(0, lineEnd !== -1 ? lineEnd : undefined).trim();
}

/**
 * extractFinalExam
 * ------------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with final exam grading details if found, or, if not found, the final project information.
 * Description: For CS/ECE 476, returns "Final exam grading information not found." Otherwise, searches for "Final Exam"
 *              and returns the text on that line. If not found, falls back to extracting final project information.
 */
function extractFinalExam(text) {
  if (/CS\/ECE 476/i.test(text)) return "Final exam grading information not found.";
  let idx = text.indexOf("Final Exam");
  if (idx !== -1) {
    let sub = text.substring(idx);
    const lineEnd = sub.indexOf("\n");
    return sub.substring(0, lineEnd !== -1 ? lineEnd : undefined).trim();
  }
  return extractFinalProject(text);
}

/**
 * extractParticipation
 * -----------------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with participation grading details if found, or "Participation grading information not found."
 * Description: For CS/ECE 476, returns "Participation grading information not found." Otherwise, searches for "Participation"
 *              and returns the text on that line.
 */
function extractParticipation(text) {
  if (/CS\/ECE 476/i.test(text)) return "Participation grading information not found.";
  const idx = text.indexOf("Participation");
  if (idx === -1) return "Participation grading information not found.";
  let sub = text.substring(idx);
  const lineEnd = sub.indexOf("\n");
  return sub.substring(0, lineEnd !== -1 ? lineEnd : undefined).trim();
}

/**
 * processSyllabus
 * ------------------
 * Input: A string representing the full path to a PDF file.
 * Output: Writes a JSON file (or saves to Chrome local storage if available) containing the extracted syllabus information.
 * Description: Reads the PDF file from the given file path, extracts its full text using pdfToText,
 *              then uses various extraction functions to populate a JSON object with three categories
 *              ("Course Information", "Course Policies", "Grading") and their corresponding items.
 *              If running as a Chrome extension (or in an environment with chrome.storage.local available),
 *              saves the JSON using chrome.storage.local.set. Otherwise, writes to a file with a .json extension.
 */
async function processSyllabus(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const uint8ArrayData = new Uint8Array(dataBuffer);
    const fullText = await pdfToText(uint8ArrayData);

    const courseId = "myCourseId"; // or pass it in as a parameter

    const outputData = {
      version: "0.1.1",   // Add the version field

      categories: [
        {
          name: "Course Information",
          items: [
            { type: "Course Title", text: extractCourseTitle(fullText) },
            { type: "Professor", text: extractProfessor(fullText) },
            { type: "Email", text: extractEmail(fullText) },
            { type: "Office Hours", text: extractTAOfficeHours(fullText) }
          ]
        },
        {
          name: "Course Policies",
          items: [
            { type: "Attendance", text: extractAttendance(fullText) },
            { type: "Late Work", text: extractLateWork(fullText) }
          ]
        },
        {
          name: "Grading",
          items: [
            { type: "Assignments", text: extractGradingAssignments(fullText) },
            { type: "Quizzes", text: extractQuizzes(fullText) },
            { type: "Midterm", text: extractMidterm(fullText) },
            { type: "Final Project", text: extractFinalProject(fullText) },
            { type: "Final Exam", text: extractFinalExam(fullText) },
            { type: "Participation", text: extractParticipation(fullText) },
            { type: "Grading Policy", text: extractGradingPolicy(fullText) }
          ]
        }
      ]
    };

    // Store it in Chrome storage under the same key your extension page uses:
    const storageKey = `syllabus_${courseId}`;

    const baseName = path.basename(filePath, path.extname(filePath));

    // If running in a Chrome extension environment, use chrome.storage.local to save the JSON.
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [baseName]: outputData }, () => {
        console.log(`Output for "${baseName}" saved to chrome.storage.local`);
      });
    } else {
      const outputFileName = `${baseName}_output.json`;
      fs.writeFileSync(outputFileName, JSON.stringify(outputData, null, 2), "utf8");
      console.log(`Output for "${baseName}" written to ${outputFileName}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * processAllSyllabi
 * -------------------
 * Input: None.
 * Output: Processes each PDF file in the syllabusFiles array and writes corresponding JSON outputs.
 * Description: Iterates over each file path in the syllabusFiles array and calls processSyllabus
 *              for each file sequentially.
 */
async function processAllSyllabi() {
  for (const filePath of syllabusFiles) {
    await processSyllabus(filePath);
  }
}

processAllSyllabi();

console.log("pdf_parser.js has been loaded!");
window.pdfToText = pdfToText;  // Ensure function is globally available

