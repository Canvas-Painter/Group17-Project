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
    image = image.convert('L')
    image = ImageEnhance.Contrast(image).enhance(2)
    image = image.point(lambda x: 0 if x < 140 else 255, '1')
    return image

def extract_text_with_ocr(pdf_path):
    text = ""
    try:
        pages = convert_from_path(pdf_path, dpi=400)
        custom_config = r'--oem 3 --psm 4'
        for page in pages:
            preprocessed_page = preprocess_image(page)
            page_text = pytesseract.image_to_string(preprocessed_page, config=custom_config)
            text += page_text + "\n"
    except Exception as e:
        print(f"Error during OCR processing of PDF file '{pdf_path}': {e}")
        sys.exit(1)
    return text

def extract_section(text, section_heading):
    pattern = rf"(?i){re.escape(section_heading)}\s*[:\n]+\s*(.*?)(?=\n[A-Z][a-z]|\Z)"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None

def extract_section_with_boundaries(text, start_heading, end_boundaries):
    boundary_pattern = "|".join([rf"\n{re.escape(b)}" for b in end_boundaries])
    pattern = rf"(?i){re.escape(start_heading)}\s*[:\n]+\s*(.*?)(?={boundary_pattern}|\Z)"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None

def extract_section_multiple(text, possible_headings):
    for heading in possible_headings:
        section_text = extract_section(text, heading)
        if section_text:
            return section_text
    return None

def filter_late_policy(text):
    lines = text.splitlines()
    filtered = [line.strip() for line in lines if "late" in line.lower() or "penalty" in line.lower()]
    return "\n".join(filtered)

def main():
    if len(sys.argv) < 2:
        print("Usage: python pdfParser.py [path_to_pdf_file]")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    print(f"Processing PDF file: {pdf_path}")
    
    pdf_text = extract_text_from_pdf(pdf_path)
    if not pdf_text.strip() or pdf_text.strip().startswith("%PDF"):
        print("pdfplumber did not extract any usable text. Trying OCR...")
        pdf_text = extract_text_with_ocr(pdf_path)
    
    # Define candidate headings and boundaries.
    sections = {
        "Late Policy": {
            "headings": ["Homework:"],
            "filter": "late_policy"
        },
        "Grading Policy": {
            "headings": ["Grading Scale:", "Grading Scale"],
            "boundaries": ["Attendance", "Course Policies"]
        },
        "Grading Weights": {
            "headings": ["Grade Evaluation:", "Grade Evaluation", "Graded Work:", "Graded Work"],
            "boundaries": ["Grading Scale"]  # For the 341 syllabus, grading weights go from Graded Work until Grading Scale.
        }
    }
    
    extracted_data = {}
    for section, params in sections.items():
        headings = params.get("headings", [])
        boundaries = params.get("boundaries", None)
        section_text = None
        if boundaries:
            for heading in headings:
                section_text = extract_section_with_boundaries(pdf_text, heading, boundaries)
                if section_text:
                    break
            # If boundaries extraction fails, fall back to extraction without boundaries.
            if not section_text:
                section_text = extract_section_multiple(pdf_text, headings)
        else:
            section_text = extract_section_multiple(pdf_text, headings)
        
        if section == "Late Policy" and section_text:
            section_text = filter_late_policy(section_text)
        
        extracted_data[section] = section_text
    
    output_lines = []
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
