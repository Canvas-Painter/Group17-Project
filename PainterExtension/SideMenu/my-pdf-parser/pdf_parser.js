// multi_pdf_parser.js



var pdfjsLib = window['pdfjs-dist/build/pdf'] || {};
pdfjsLib.GlobalWorkerOptions = pdfjsLib.GlobalWorkerOptions || {};
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

// Ensure `getDocument` is properly assigned
var getDocument = pdfjsLib.getDocument || function() { console.error("PDF.js not loaded!"); };


console.log("pdf_parser.js has been loaded!");
window.pdfToText = pdfToText;  // Ensure function is globally available
console.log("Is pdfToText available in pdf_parser.js?", typeof window.pdfToText);

console.log("Ensuring PDF.js is loaded...");

// Check if pdfjsLib is already available
if (typeof window.pdfjsLib === "undefined" || typeof window.pdfjsLib.getDocument !== "function") {
    console.warn("PDF.js is missing. Injecting dynamically...");
    var script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.min.js";
    script.onload = function () {
        console.log("PDF.js dynamically loaded.");
        window.pdfjsLib = window['pdfjs-dist/build/pdf'] || {};
        window.pdfjsLib.GlobalWorkerOptions = window.pdfjsLib.GlobalWorkerOptions || {};
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';
    };
    document.head.appendChild(script);
}

// Ensure `getDocument` is properly assigned
var getDocument = function (data) {
    if (typeof pdfjsLib !== "undefined" && typeof pdfjsLib.getDocument === "function") {
        return pdfjsLib.getDocument(data);
    } else {
        console.error("PDF.js not loaded properly.");
        return null;
    }
};



/**
 * pdfToText
 * -----------
 * Input: A Uint8Array or ArrayBuffer containing the PDF file data.
 * Output: A Promise that resolves to a string with the full text extracted from the PDF.
 * Description: Loads the PDF document using pdf.js, iterates over each page, extracts the text content from
 *              each text block, concatenates the text (inserting newlines as appropriate), and returns the
 *              complete text.
 */
function pdfToText(data) {
  return new Promise(function (resolve, reject) {
      var loadingTask = getDocument(data);
      loadingTask.promise.then(function (pdf) {
          var fullText = "";
          var pages = [];
          for (var i = 1; i <= pdf.numPages; i++) {
              pages.push(
                  pdf.getPage(i).then(function (page) {
                      return page.getTextContent().then(function (textContent) {
                          var pageText = "";
                          var lastBlock = null;
                          var blocks = textContent.items;
                          for (var k = 0; k < blocks.length; k++) {
                              var block = blocks[k];
                              if (lastBlock !== null && lastBlock.str[lastBlock.str.length - 1] !== ' ') {
                                  if (block.transform[4] < lastBlock.transform[4]) {
                                      pageText += "\r\n";
                                  } else if (
                                      lastBlock.transform[5] !== block.transform[5] &&
                                      !/\s?[a-zA-Z]$/.test(lastBlock.str)
                                  ) {
                                      pageText += ' ';
                                  }
                              }
                              pageText += block.str;
                              lastBlock = block;
                          }
                          return pageText + "\n\n";
                      });
                  })
              );
          }
          Promise.all(pages).then(function (results) {
              fullText = results.join("");
              resolve(fullText);
          });
      }).catch(function (error) {
          reject(error);
      });
  });
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
 * Description: For a class, if detected, extracts text starting at "Evaluation of Student Performance"
 *              until the first double newline. Otherwise, it searches for the "Grade Weighting" section,
 *              extracts a chunk of text, filters for lines containing "%" (grade weights) and letter-grade lines,
 *              and returns the combined result.
 */
function extractGradingPolicy(text) {
  const gradingKeywords = ["grading policy", "grade weighting", "evaluation criteria", "grading scale", "assessment breakdown", "grading system", "grading scheme", "course grading"];
  const lines = text.split("\n").map(function(line) {
      return line.trim();
  });
  
  for (var i = 0; i < lines.length; i++) {
      var lowerLine = lines[i].toLowerCase();
      for (var j = 0; j < gradingKeywords.length; j++) {
          if (lowerLine.includes(gradingKeywords[j])) {
              let gradingText = lines[i];
              for (var k = i + 1; k < Math.min(i + 7, lines.length); k++) {
                  if (lines[k].trim() === "") break;
                  gradingText += "\n" + lines[k];
              }
              return gradingText;
          }
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
  const quizKeywords = ["quizzes", "quiz", "weekly quizzes", "pop quizzes", "quiz grading", "assessment quizzes", "online quizzes"];
  const lines = text.split("\n").map(function(line) {
      return line.trim();
  });
  
  for (var i = 0; i < lines.length; i++) {
      var lowerLine = lines[i].toLowerCase();
      for (var j = 0; j < quizKeywords.length; j++) {
          if (lowerLine.includes(quizKeywords[j])) {
              let quizText = lines[i];
              for (var k = i + 1; k < Math.min(i + 5, lines.length); k++) {
                  if (lines[k].trim() === "") break;
                  quizText += "\n" + lines[k];
              }
              return quizText;
          }
      }
  }
  
  return "Quiz grading information not found.";
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
  const lines = text.split("\n").map(function(line) {
      return line.trim();
  }).filter(function(line) {
      return line.length > 0;
  });
  
  for (var i = 0; i < lines.length; i++) {
      var line = lines[i].toLowerCase();
      if (line.includes("course title") || line.includes("introduction to") || line.match(/^[a-z]+ \d{3}/i)) {
          return lines[i];
      }
  }
  
  for (var j = 0; j < lines.length; j++) {
      var line = lines[j].toLowerCase();
      if (!line.startsWith("last updated") && !line.includes("syllabus") && line.length > 3) {
          return lines[j];
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
function extractCourseTitle(text) {
  const lines = text.split("\n").map(function(line) {
      return line.trim();
  }).filter(function(line) {
      return line.length > 0;
  });
  
  for (var i = 0; i < lines.length; i++) {
      var line = lines[i].toLowerCase();
      if (line.includes("course title") || line.includes("introduction to") || line.match(/^[a-z]+ \d{3}/i)) {
          return lines[i];
      }
  }
  
  for (var j = 0; j < lines.length; j++) {
      var line = lines[j].toLowerCase();
      if (!line.startsWith("last updated") && !line.includes("syllabus") && line.length > 3) {
          return lines[j];
      }
  }
  
  return "Course title not found.";
}

function extractProfessor(text) {
  const lines = text.split("\n").map(function(line) {
      return line.trim();
  }).filter(function(line) {
      return line.length > 0;
  });
  
  for (var i = 0; i < lines.length; i++) {
      var line = lines[i].toLowerCase();
      if (line.includes("instructor:") || line.includes("professor:") || line.includes("about the instructor")) {
          return lines[i].replace(/instructor:|professor:|about the instructor/i, "").trim();
      }
  }
  
  return "Professor not found.";
}


/**
 * extractEmail
 * --------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with an email address if found, or "Email not found."
 * Description: Uses a regular expression to search for a pattern that matches an email address in the text.
 */
function extractEmail(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  if (!matches) return "Email not found.";
  
  // Find the first email that appears near an "Instructor" or "Professor" reference
  const lines = text.split("\n");
  for (var i = 0; i < lines.length; i++) {
      if (/instructor|professor|email/i.test(lines[i])) {
          for (var j = i; j < Math.min(i + 5, lines.length); j++) { // Search within the next 5 lines
              const emailMatch = lines[j].match(emailRegex);
              if (emailMatch) {
                  return emailMatch[0];
              }
          }
      }
  }
  
  // If no nearby match is found, return the first email found
  return matches[0];
}

/**
 * extractAttendance
 * --------------------
 * Input: A string containing the full text extracted from the PDF.
 * Output: A string with the attendance policy details if found, or "Attendance policy not found."
 * Description: Searches for the marker "Attendance" and returns the text on that line.
 */
function extractAttendance(text) {
  const attendanceKeywords = ["attendance policy", "class attendance", "participation requirement", "attendance expectations", "attendance is mandatory", "attendance requirement"];
  const lines = text.split("\n").map(function(line) {
      return line.trim();
  });
  
  for (var i = 0; i < lines.length; i++) {
      var lowerLine = lines[i].toLowerCase();
      for (var j = 0; j < attendanceKeywords.length; j++) {
          if (lowerLine.includes(attendanceKeywords[j])) {
              return lines[i];
          }
      }
  }
  
  return "Attendance policy not found.";
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
  const lateWorkKeywords = ["late policy", "late work policy", "late submission", "late homework", "late assignment", "penalty for late", "late penalties"];
  const lines = text.split("\n").map(function(line) {
      return line.trim();
  });
  
  for (var i = 0; i < lines.length; i++) {
      var lowerLine = lines[i].toLowerCase();
      for (var j = 0; j < lateWorkKeywords.length; j++) {
          if (lowerLine.includes(lateWorkKeywords[j])) {
              let policyText = lines[i];
              for (var k = i + 1; k < Math.min(i + 5, lines.length); k++) {
                  if (lines[k].trim() === "") break;
                  policyText += "\n" + lines[k];
              }
              return policyText;
          }
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
  const gradingKeywords = ["assignments", "homework", "assignment grading", "grade breakdown", "evaluation criteria"];
  const lines = text.split("\n").map(function(line) {
      return line.trim();
  });
  
  for (var i = 0; i < lines.length; i++) {
      var lowerLine = lines[i].toLowerCase();
      for (var j = 0; j < gradingKeywords.length; j++) {
          if (lowerLine.includes(gradingKeywords[j])) {
              let gradingText = lines[i];
              for (var k = i + 1; k < Math.min(i + 5, lines.length); k++) {
                  if (lines[k].trim() === "") break;
                  gradingText += "\n" + lines[k];
              }
              return gradingText;
          }
      }
  }
  
  return "Assignment grading information not found.";
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
  const midtermKeywords = ["midterm", "mid-term exam", "midterm examination", "midterm grading", "midterm weight"];
  const lines = text.split("\n").map(function(line) {
      return line.trim();
  });
  
  for (var i = 0; i < lines.length; i++) {
      var lowerLine = lines[i].toLowerCase();
      for (var j = 0; j < midtermKeywords.length; j++) {
          if (lowerLine.includes(midtermKeywords[j])) {
              let midtermText = lines[i];
              for (var k = i + 1; k < Math.min(i + 5, lines.length); k++) {
                  if (lines[k].trim() === "") break;
                  midtermText += "\n" + lines[k];
              }
              return midtermText;
          }
      }
  }
  
  return "Midterm grading information not found.";
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
  const projectKeywords = ["final project", "project", "capstone project", "major project", "term project", "course project"];
  const lines = text.split("\n").map(function(line) {
      return line.trim();
  });
  
  for (var i = 0; i < lines.length; i++) {
      var lowerLine = lines[i].toLowerCase();
      for (var j = 0; j < projectKeywords.length; j++) {
          if (lowerLine.includes(projectKeywords[j])) {
              let projectText = lines[i];
              for (var k = i + 1; k < Math.min(i + 5, lines.length); k++) {
                  if (lines[k].trim() === "") break;
                  projectText += "\n" + lines[k];
              }
              return projectText;
          }
      }
  }
  
  return "Final project grading information not found.";
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
  const finalExamKeywords = ["final exam", "final examination", "final test", "final assessment", "comprehensive exam"];
  const lines = text.split("\n").map(function(line) {
      return line.trim();
  });
  
  for (var i = 0; i < lines.length; i++) {
      var lowerLine = lines[i].toLowerCase();
      for (var j = 0; j < finalExamKeywords.length; j++) {
          if (lowerLine.includes(finalExamKeywords[j])) {
              let finalExamText = lines[i];
              for (var k = i + 1; k < Math.min(i + 5, lines.length); k++) {
                  if (lines[k].trim() === "") break;
                  finalExamText += "\n" + lines[k];
              }
              return finalExamText;
          }
      }
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
  const participationKeywords = ["participation", "class participation", "engagement", "attendance and participation", "discussion participation", "student involvement"];
  const lines = text.split("\n").map(function(line) {
      return line.trim();
  });
  
  for (var i = 0; i < lines.length; i++) {
      var lowerLine = lines[i].toLowerCase();
      for (var j = 0; j < participationKeywords.length; j++) {
          if (lowerLine.includes(participationKeywords[j])) {
              let participationText = lines[i];
              for (var k = i + 1; k < Math.min(i + 5, lines.length); k++) {
                  if (lines[k].trim() === "") break;
                  participationText += "\n" + lines[k];
              }
              return participationText;
          }
      }
  }
  
  return "Participation grading information not found.";
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
var syllabusFiles = syllabusFiles || []; // Ensure it's at least an empty array
async function processAllSyllabi() {
  for (const filePath of syllabusFiles) {
    await processSyllabus(filePath);
  }
}

processAllSyllabi();

console.log("pdf_parser.js has been loaded!");

if (typeof window !== "undefined") {
  window.pdfToText = pdfToText;
  console.log("pdf_parser.js has been fully loaded. pdfToText is now available.");
}
