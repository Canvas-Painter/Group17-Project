from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

from common import driver, sample_grades
from os import path
from time import sleep

# Sample calculations
test1 = [
    ('Discussions', '10', '97.1', '9.83'),
    ('Discussions', '10', '97.2', '10.33 Likely impossible'),
    ('Discussions', '10', '5', '-450.67 Likely impossible'),
    ('Quizzes', '50', '94', '3.42'),
    ('Exam', '50', '94', '26.83')
]

# Sample calculations
test2 = [
    ('Final Exam', '100', '98', '102.35 Likely impossible'),
    ('Labs', '100', '80', '-72.27 Likely impossible'),
    ('Exams', '200', '80', '37.80'),
    ('Get Ready\'s', '70', '96', '10.97'),
]


# Inputs a series of tests to the grade calculator
def run_target_grades(driver, tests):
    # The inputs things
    dropdown = Select(driver.find_element(By.ID, 'test-dropdown'))
    points = driver.find_element(By.ID, 'test-points')
    grade = driver.find_element(By.ID, 'test-grade')
    output = driver.find_element(By.ID, 'test-output')

    # Loops through and inputs the tests
    for drop, point, target, out in tests:
        dropdown.select_by_value(drop)

        points.clear()
        points.send_keys(point + '\n')

        grade.clear()
        grade.send_keys(target + '\n')

        assert output.text == out


def test_grades1():
    driver.get(sample_grades[0])
    # Gives time to load
    sleep(2)

    # Check html loaded
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[7]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[8]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[9]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[10]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[11]')) > 0

    # Run grade tests
    run_target_grades(driver, test1)


def test_grades2():
    driver.get(sample_grades[1])
    # Gives time to load
    sleep(2)

    # Check html loaded
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[7]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[8]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[9]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[10]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[11]')) > 0

    # Run grade tests
    run_target_grades(driver, test2)
