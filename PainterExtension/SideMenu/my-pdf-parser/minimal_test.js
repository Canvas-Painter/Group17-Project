// pages/api/parse-pdf.js

import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

// Disable Next.js's default body parser to handle multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to extract professor email using regex
const extractEmail = (text) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : 'Not found';
};

// Helper function to extract TA office hours
const extractTAOfficeHours = (text) => {
  // This regex looks for "TA Office Hours:" followed by any text until a newline.
  const taRegex = /TA Office Hours:?\s*(.+)/i;
  const match = text.match(taRegex);
  return match ? match[1].trim() : 'Not found';
};

// Helper function to extract grading policy details
const extractGradingPolicy = (text) => {
  // This regex assumes the grading policy starts with "Grading Policy:" and captures text until the next header or end-of-file.
  const policyRegex = /Grading Policy:([\s\S]*?)(\n[A-Z][a-z]+:|\n$)/;
  const match = text.match(policyRegex);
  return match ? match[1].trim() : 'Not found';
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  // Use formidable to parse the incoming form with file upload
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      res.status(500).json({ error: 'Error parsing form data' });
      return;
    }

    // Assuming the file is sent with the field name "pdf"
    const pdfFile = files.pdf;
    if (!pdfFile) {
      res.status(400).json({ error: 'No PDF file uploaded' });
      return;
    }

    try {
      // Read the uploaded PDF file into a buffer
      const dataBuffer = fs.readFileSync(pdfFile.path);

      // Extract text using pdf-parse
      const data = await pdf(dataBuffer);
      const text = data.text;

      // Extract the specific pieces of information
      const professorEmail = extractEmail(text);
      const taOfficeHours = extractTAOfficeHours(text);
      const gradingPolicy = extractGradingPolicy(text);

      // Combine the results into a text output
      const outputText = `Professor Email: ${professorEmail}\nTA Office Hours: ${taOfficeHours}\nGrading Policy: ${gradingPolicy}`;

      // Write output to a txt file in a temporary directory
      // On Vercel, using /tmp/ is recommended since it's writable.
      const filePath = process.env.VERCEL
        ? path.join('/tmp', 'output.txt')
        : path.join(process.cwd(), 'output.txt');

      fs.writeFileSync(filePath, outputText, 'utf8');

      // Set headers to prompt the file download
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename=output.txt');

      // Send the file content as the response
      res.status(200).send(outputText);
    } catch (parseError) {
      console.error('Error parsing PDF:', parseError);
      res.status(500).json({ error: 'Error processing PDF file' });
    }
  });
}
