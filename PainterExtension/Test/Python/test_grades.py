from selenium.webdriver.common.by import By

from common import driver, extension_path
from os import path

def test_grades1():
    driver.get('file://' + path.join(extension_path, 'Test/Python/samples/grades1.html'))
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[7]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[8]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[9]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[10]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[11]')) > 0




def test_grades2():
    driver.get('file://' + path.join(extension_path, 'Test/Python/samples/grades2.html'))
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[7]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[8]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[9]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[10]')) > 0
    assert len(driver.find_elements(By.XPATH, '//*[@id="student-grades-right-content"]/div[11]')) > 0

