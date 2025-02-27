from selenium.webdriver.common.by import By
from PIL import Image
import io
import numpy as np
from selenium.webdriver.support.ui import Select

from common import driver, extension_url, extension_path, sample_pages

def get_screen(driver):
    # Gets the screenshot as a np array
    return np.asarray(Image.open(io.BytesIO(driver.get_screenshot_as_png())))


# https://stackoverflow.com/questions/12201577/how-can-i-convert-an-rgb-image-into-grayscale-in-python
# I don't want to add opencv to the required libraries
def rgb2gray(rgb):
    return np.dot(rgb[..., :3], [0.2989, 0.5870, 0.1140])


def test_darkmmode():
    driver.get(extension_url + 'addressbarPopup/popup.html')
    # Enable dark mode
    driver.find_element(By.XPATH, '/html/body/div/div[1]/label').click()

    # Check average pixel color
    for page in sample_pages:
        driver.get(page)
        assert np.median(rgb2gray(get_screen(driver))) < 70


# Checks that the active color is valid
def check_color(lower_bounds, upper_bounds):
    # Check average pixel colors
    for page in sample_pages:
        driver.get(page)
        for i, (lower, upper) in enumerate(zip(lower_bounds, upper_bounds)):
            assert lower <= np.median(get_screen(driver)[..., i]) <= upper


# Makes a new color for the extension and makes it active
def make_color(name, color):
    driver.get(extension_url + 'addressbarPopup/popup.html')
    # Set all colors
    for elem in driver.find_elements(By.XPATH, '//input[@type=\'color\']'):
        elem.send_keys(color)

    driver.find_element(By.XPATH, '/html/body/div/div[2]/input').send_keys(name)
    driver.find_element(By.XPATH, '/html/body/div/div[3]/button').click()


# Loads a color for the extension and makes it active
def load_color(name):
    driver.get(extension_url + 'addressbarPopup/popup.html')

    elem = driver.find_element(By.XPATH, '/html/body/div/div[4]/select')
    Select(elem).select_by_visible_text(name)
    # Click it once incase the color was the default in which case selenium does nothing for some reason
    elem.click()


# Uses the colors red
def test_custom_colors_and_load():
    red_checks = [220, 30, 30], [256, 60, 60]
    green_checks = [90, 220, 60], [130, 256, 90]

    # Tries to make the colors red
    make_color('red', '#FF0000')
    check_color(*red_checks)

    # Tries to make the colors green
    make_color('green', '#00FF00')
    check_color(*green_checks)

    load_color('red')
    check_color(*red_checks)

    load_color('green')
    check_color(*green_checks)
