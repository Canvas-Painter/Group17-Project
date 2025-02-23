from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

myURL = "http://localhost:3000/extract"  # Global variable for testing (can change)


#
# Makes sure the pdf is actually a syllabus (use this for merging API code with PDF parser), and if not; doesn't throw bad error
#

def test_upload_valid_pdf(pdf_file_path):
    driver = webdriver.Chrome()
    driver.get(myURL)

    file_input = driver.find_element(By.NAME, "file")
    file_input.send_keys(pdf_file_path)     # Try working syllabus, and also random text-only pdf

    submit_button = driver.find_element(By.ID, "submit")
    submit_button.click()

    time.sleep(2)  # Needs time to process

    response_text = driver.find_element(By.TAG_NAME, "body").text   # Check that all methods exist in the pdf
    assert "Late Policy" in response_text
    assert "Grading Policy" in response_text
    assert "Grading Weights" in response_text

    driver.quit()   # Selenium syntax


#
# Tests if attempting to send a corrupt/non-pdf file does not result in a bad error
#

def test_upload_invalid_file(corrupt_file_path):
    driver = webdriver.Chrome()
    driver.get(myURL)

    file_input = driver.find_element(By.NAME, "file")
    file_input.send_keys(corrupt_file_path)  # Should be a corrupt or .txt file

    submit_button = driver.find_element(By.ID, "submit")
    submit_button.click()

    time.sleep(2)   # Needs time to process

    response_text = driver.find_element(By.TAG_NAME, "body").text
    assert "No file provided" in response_text or "No file selected" in response_text

    driver.quit()   # Selenium syntax


#
# Ensures that (in our context), "convert_from_path" function properly reads text from a pdf and doesn't throw a bad error // Ensures OCR works properly
#

def test_ocr_extraction(pdf_file_path):
    driver = webdriver.Chrome()
    driver.get(myURL)

    file_input = driver.find_element(By.NAME, "file")
    file_input.send_keys(pdf_file_path)     # Should test pdf's containing images, non-text elements, etc.

    submit_button = driver.find_element(By.ID, "submit")
    submit_button.click()

    time.sleep(5)  # Needs time to process (this test seems to take a bit longer)

    response_text = driver.find_element(By.TAG_NAME, "body").text
    assert "Late Policy" in response_text or "Grading Policy" in response_text  # Determines if at least one of these strings were found

    driver.quit()   # Selenium syntax


#
# Checks that a PDF gives no errors even if it is missing key information
#

def test_missing_sections(pdf_file_path):
    driver = webdriver.Chrome()
    driver.get(myURL)

    file_input = driver.find_element(By.NAME, "file")
    file_input.send_keys(pdf_file_path)  # Should try using a pdf that is lacking all of the search terms.

    submit_button = driver.find_element(By.ID, "submit")
    submit_button.click()

    time.sleep(2)   # Needs time to process

    response_text = driver.find_element(By.TAG_NAME, "body").text
    assert '"Late Policy": null' in response_text or '"Grading Weights": null' in response_text     # May need to change for compatability; ensures instead of errors, missing information is instead acknowledged.

    driver.quit()   # Selenium syntax
