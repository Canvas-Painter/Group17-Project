from selenium.webdriver.common.by import By

from common import driver

def test_driver():
    driver.get('https://www.google.com/')
    # Checks whether google is on the page
    assert len(driver.find_elements(By.XPATH, '//*[contains(text(), \'google\')]')) > 0
