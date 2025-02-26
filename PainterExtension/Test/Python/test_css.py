from selenium.webdriver.common.by import By
from os.path import join
from PIL import Image
import io
import numpy as np

from common import driver, extension_url, extension_path

def get_screen(driver):
    # Gets the screenshot as a np array
    return np.asarray(Image.open(io.BytesIO(driver.get_screenshot_as_png())))


# https://stackoverflow.com/questions/12201577/how-can-i-convert-an-rgb-image-into-grayscale-in-python
# I don't want to add opencv to the required libraries
def rgb2gray(rgb):
    return np.dot(rgb[...,:3], [0.2989, 0.5870, 0.1140])


def test_darkmmode():
    driver.get(extension_url + 'addressbarPopup/popup.html')
    # Enable dark mode
    driver.find_element(By.XPATH, '/html/body/div/div[1]/label').click()

    # Check average pixel color
    driver.get('file://' + join(extension_path, 'Test/Python/samples/grades1.html'))
    assert np.median(rgb2gray(get_screen(driver))) < 70
    driver.get('file://' + join(extension_path, 'Test/Python/samples/grades2.html'))
    assert np.median(rgb2gray(get_screen(driver))) < 70
