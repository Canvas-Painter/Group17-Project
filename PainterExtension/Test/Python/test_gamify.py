from selenium.webdriver.common.by import By

from common import driver, sample_calendars

import time

def test_gamify():
    # Loads page
    driver.get(sample_calendars[0])

    driver.find_element(By.XPATH, '/html/body/div[3]/header[2]/div[1]/ul/li[6]/label').click()

    driver.switch_to.alert.accept()

    assert driver.find_element(By.XPATH, '/html/body/div[3]/div[2]/div/div[2]/div[1]/div/div[2]/div[6]/div[1]').text == '🔒'
    assert driver.find_element(By.XPATH, '/html/body/div[3]/div[2]/div/div[2]/div[1]/div/div[2]/div[6]/div[2]').text == '🔒'
    assert driver.find_element(By.XPATH, '/html/body/div[3]/div[2]/div/div[2]/div[1]/div/div[2]/div[6]/div[3]').text == '🧙'
    assert driver.find_element(By.XPATH, '/html/body/div[3]/div[2]/div/div[2]/div[1]/div/div[2]/div[6]/div[4]').text == '💬'
    assert driver.find_element(By.XPATH, '/html/body/div[3]/div[2]/div/div[2]/div[1]/div/div[2]/div[6]/div[5]').text == '🔒'

    assert driver.find_element(By.XPATH, '/html/body/div[3]/div[2]/div/div[2]/div[1]/div/div[2]/div[4]/h1').text == '57.9% of assignments turned in this month'
