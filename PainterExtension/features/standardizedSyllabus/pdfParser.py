#!/usr/bin/env python3
"""
PDF Syllabus Parser with OCR fallback

This script attempts to extract crucial sections from a Canvas syllabus PDF:
  - Late Policy: should contain late submission penalty details (extracted from the Homework section and then filtered).
  - Grading Policy: should contain the letter grade ranges (extracted from the Grading Scale section).
  - Grading Weights: should contain the course grade evaluation breakdown (extracted from the Grade Evaluation section).

If no text is extracted via pdfplumber, it will attempt to use OCR.
It prints the extracted sections to the terminal and writes them to a text file.

Usage:
    python pdfParser.py "YourSyllabus.pdf"

Requirements:
    - pdfplumber (pip install pdfplumber)
    - pdf2image (pip install pdf2image)
    - pytesseract (pip install pytesseract)
    - Pillow (pip install Pillow)
    - Tesseract OCR installed on your system (ensure 'tesseract' is in your PATH)
"""

import pdfplumber
import re
import sys
import os
from pdf2image import convert_from_path
import pytesseract
from PIL import Image, ImageEnhance

def extract_text_from_pdf(pdf_path):
    """
    Input:
      pdf_path (str) - The file path to the PDF file.
    Output:
      Returns a string containing all the text extracted from the PDF.
    Function description:
      Opens the specified PDF file using pdfplumber, iterates over each page, and extracts the text.
      If a page has text, it appends it to a cumulative result (adding a newline after each page).
      In case of an exception (e.g., if the file can't be read), an error message is printed and the
      program exits.
    """
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF file '{pdf_path}': {e}")
        sys.exit(1)
    return text


def preprocess_image(image):
    """
    Input:
        image (PIL.Image.Image) - The image object to be processed.
    Output:
        Returns a processed image object in binary (black and white) format.
    Function description:
        Converts the input image to grayscale, enhances its contrast by a factor of 2,
        and applies binary thresholding so that pixels with a value less than 140 become 0 (black)
        and those equal to or greater than 140 become 255 (white). This preprocessing can improve OCR accuracy.
    """
    image = image.convert('L')
    image = ImageEnhance.Contrast(image).enhance(2)
    image = image.point(lambda x: 0 if x < 140 else 255, '1')
    return image


def extract_text_with_ocr(pdf_path):
    """
    Input:
        pdf_path (str): The file path to the PDF to be processed using OCR.
    Output:
        Returns a string containing the text extracted from the PDF via OCR.
    Function description:
        This function converts each page of the specified PDF into a high-resolution image (400 dpi)
        using convert_from_path. Each image is then pre-processed (converted to grayscale, contrast enhanced,
        and binarized) by preprocess_image to improve OCR accuracy. pytesseract is used with a custom configuration
        (OCR Engine Mode 3 and Page Segmentation Mode 4) to extract text from each processed image. The text from
        all pages is concatenated with newline separators. If an exception occurs during processing, an error message
        is printed and the program exits.
    """
    text = ""
    try:
        # Convert PDF pages to images with 400 dpi for better resolution.
        pages = convert_from_path(pdf_path, dpi=400)
        # Set Tesseract OCR configuration: OEM 3 (default) and PSM 4 (assumes a single column of text).
        custom_config = r'--oem 3 --psm 4'
        for page in pages:
            # Preprocess each page image to improve OCR results.
            preprocessed_page = preprocess_image(page)
            # Extract text from the preprocessed image using pytesseract.
            page_text = pytesseract.image_to_string(preprocessed_page, config=custom_config)
            # Append the extracted text from the current page, followed by a newline.
            text += page_text + "\n"
    except Exception as e:
        # Print an error message if OCR processing fails and exit the program.
        print(f"Error during OCR processing of PDF file '{pdf_path}': {e}")
        sys.exit(1)
    return text

def extract_section(text, section_heading):
    """
    Input:
        text (str): The full text from which to extract the section.
        section_heading (str): The heading that marks the beginning of the section.
    Output:
        Returns a string containing the extracted section content if found; otherwise, returns None.
    Function description:
        This function uses a regular expression to locate and extract a section of text starting
        from the specified section_heading. The regex is case-insensitive and looks for the given
        heading (properly escaped) followed by a colon or newline, and then captures all text until
        it encounters a new line that begins with a capital letter (assumed to be the next section header)
        or until the end of the text. The captured section is then stripped of any leading or trailing
        whitespace and returned.
    """
    pattern = rf"(?i){re.escape(section_heading)}\s*[:\n]+\s*(.*?)(?=\n[A-Z][a-z]|\Z)"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None


def extract_section_with_boundaries(text, start_heading, end_boundaries):
    """
    Input:
        text (str): The full text from which to extract the section.
        start_heading (str): The heading that marks the beginning of the section.
        end_boundaries (list of str): A list of strings that indicate where the section should end.
    Output:
        Returns a string containing the extracted section content if found; otherwise, returns None.
    Function description:
        This function builds a regex pattern to extract a section of text that starts at the given
        start_heading and continues until one of the specified end_boundaries is encountered (each
        preceded by a newline) or until the end of the text if none of the boundaries are found.
        It returns the extracted section with leading and trailing whitespace removed.
    """
    boundary_pattern = "|".join([rf"\n{re.escape(b)}" for b in end_boundaries])
    pattern = rf"(?i){re.escape(start_heading)}\s*[:\n]+\s*(.*?)(?={boundary_pattern}|\Z)"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None


def extract_section_multiple(text, possible_headings):
    """
    Input:
        text (str): The complete text from which to extract a section.
        possible_headings (list of str): A list of candidate headings that might mark the start of the desired section.
    Output:
        Returns a string containing the extracted section corresponding to the first candidate heading found,
        or returns None if no matching section is found.
    Function description:
        This function iterates over the list of possible headings and uses the extract_section function to
        attempt extraction for each heading. It returns the content of the first section found that is not empty.
        If none of the candidate headings yield a valid section, it returns None.
    """
    for heading in possible_headings:
        section_text = extract_section(text, heading)
        if section_text:
            return section_text
    return None


def filter_late_policy(text):
    """
    Input:
        text (str): A string containing text that may include late submission policy details.
    Output:
        Returns a string containing only the lines that mention "late" or "penalty".
    Function description:
        Splits the input text into individual lines, filters out lines that do not contain the substrings
        "late" or "penalty" (in a case-insensitive manner), and then joins the remaining lines with newline characters.
        This helps isolate the late submission penalty details from a larger block of text.
    """
    lines = text.splitlines()
    filtered = [line.strip() for line in lines if "late" in line.lower() or "penalty" in line.lower()]
    return "\n".join(filtered)


def main():
    """
    Input:
        None (reads the PDF file path from command-line arguments).
    Output:
        Writes the extracted sections to an output text file and prints them to the terminal.
    Function description:
        This function processes a PDF file provided as a command-line argument. It first attempts to extract text using pdfplumber.
        If no usable text is found, it falls back to OCR extraction. It then defines candidate headings and boundaries for three sections:
          - Late Policy: Extracted from the Homework section and filtered for "late" or "penalty".
          - Grading Policy: Extracted from the Grading Scale section, stopping at boundaries like "Attendance" or "Course Policies".
          - Grading Weights: Extracted from either the Grade Evaluation or Graded Work sections, stopping at the "Grading Scale" boundary.
        Finally, the extracted sections are printed to the terminal and written to an output text file.
    """
    if len(sys.argv) < 2:
        print("Usage: python pdfParser.py [path_to_pdf_file]")
        sys.exit(1)

    # Get the PDF file path from the command-line arguments.
    pdf_path = sys.argv[1]
    print(f"Processing PDF file: {pdf_path}")

    # Extract text using pdfplumber.
    pdf_text = extract_text_from_pdf(pdf_path)
    # If no usable text is extracted or the text appears to be raw PDF data, fall back to OCR extraction.
    if not pdf_text.strip() or pdf_text.strip().startswith("%PDF"):
        print("pdfplumber did not extract any usable text. Trying OCR...")
        pdf_text = extract_text_with_ocr(pdf_path)

    # Define candidate headings and boundaries for each section.
    sections = {
        "Late Policy": {
            "headings": ["Homework:"],
            "filter": "late_policy"  # Later, filter to retain only lines with "late" or "penalty".
        },
        "Grading Policy": {
            "headings": ["Grading Scale:", "Grading Scale"],
            "boundaries": ["Attendance", "Course Policies"]
        },
        "Grading Weights": {
            "headings": ["Grade Evaluation:", "Grade Evaluation", "Graded Work:", "Graded Work"],
            "boundaries": ["Grading Scale"]  # Extraction stops at "Grading Scale" for the 341 syllabus.
        }
    }

    extracted_data = {}
    # Iterate over each section and extract its text.
    for section, params in sections.items():
        headings = params.get("headings", [])
        boundaries = params.get("boundaries", None)
        section_text = None
        if boundaries:
            # Try extracting using each candidate heading with boundaries.
            for heading in headings:
                section_text = extract_section_with_boundaries(pdf_text, heading, boundaries)
                if section_text:
                    break
            # If extraction with boundaries fails, fall back to extraction without boundaries.
            if not section_text:
                section_text = extract_section_multiple(pdf_text, headings)
        else:
            section_text = extract_section_multiple(pdf_text, headings)

        # For Late Policy, filter the extracted text for lines containing "late" or "penalty".
        if section == "Late Policy" and section_text:
            section_text = filter_late_policy(section_text)

        extracted_data[section] = section_text

    output_lines = []
    # Prepare and print output for each section.
    for section, content in extracted_data.items():
        header = f"--- {section} ---"
        output_lines.append(header)
        print(header)
        if content:
            output_lines.append(content)
            print(content)
        else:
            not_found_msg = "Section not found."
            output_lines.append(not_found_msg)
            print(not_found_msg)
        output_lines.append("\n")

    # Build the output file path and write the extracted content.
    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    output_filename = os.path.join(os.getcwd(), base_name + "_extracted.txt")
    try:
        with open(output_filename, "w") as f:
            f.write("\n".join(output_lines))
        print(f"\nExtracted sections have been written to: {output_filename}")
    except Exception as e:
        print(f"Error writing to file '{output_filename}': {e}")

if __name__ == "__main__":
    main()
