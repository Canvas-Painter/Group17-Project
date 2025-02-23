from selenium.webdriver.common.by import By
from os.path import join
from PIL import Image
import io
import numpy as np

from common import driver, extension_url, extension_path

def get_screen(driver):
    # Gets the screenshot as a np array
    return np.asarray(Image.open(io.BytesIO(driver.get_screenshot_as_png())))


def test_darkmmode():
    driver.get(extension_url + 'addressbarPopup/popup.html')
    # Enable dark mode
    driver.find_element(By.XPATH, '/html/body/div/label').click()

    # Check average pixel color
    driver.get('file://' + join(extension_path, 'Test/Python/samples/grades1.html'))
    assert np.average(get_screen(driver)) < 50
    driver.get('file://' + join(extension_path, 'Test/Python/samples/grades2.html'))
    assert np.average(get_screen(driver)) < 50
