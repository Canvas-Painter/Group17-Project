from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

from common import driver, sample_pages


def get_child(ele):
    return ele.find_element(By.XPATH, './*')


def check_edit(driver, first_path, first_value_path, first_text, first_value_text):
    driver.find_element(By.CLASS_NAME, 'edit-mode-btn').click()

    first = driver.find_element(By.XPATH, first_path)
    first.click()
    child = get_child(first)
    child.send_keys(Keys.CONTROL + 'a' + Keys.DELETE)
    child.send_keys(first_text + Keys.ENTER)

    firstValue = driver.find_element(By.XPATH, first_value_path)
    firstValue.click()
    get_child(firstValue).send_keys(first_value_text + Keys.ENTER)

    first = driver.find_element(By.XPATH, first_path)
    assert first.text == first_text
    firstValue = driver.find_element(By.XPATH, first_value_path)
    assert firstValue.text == first_value_text


def check_cancel(driver, first_path, first_value_path):
    driver.find_element(By.CLASS_NAME, 'cancel-btn').click()

    first = driver.find_element(By.XPATH, first_path)
    assert first.text == 'Course Title'
    firstValue = driver.find_element(By.XPATH, first_value_path)
    assert firstValue.text == ''


def check_delete(driver, first_path, first_delete_path):
    driver.find_element(By.CLASS_NAME, 'edit-mode-btn').click()

    driver.find_element(By.XPATH, first_delete_path).click()

    first = driver.find_element(By.XPATH, first_path)
    assert first.text == 'Professor'


def check_done_edit(driver, first_path, first_value_path, first_text, first_value_text):
    driver.find_element(By.CLASS_NAME, 'done-btn').click()

    first = driver.find_element(By.XPATH, first_path)
    assert first.text == first_text

    first = driver.find_element(By.XPATH, first_value_path)
    assert first.text == first_value_text


def check_done_delete(driver, first_path):
    driver.find_element(By.CLASS_NAME, 'done-btn').click()

    first = driver.find_element(By.XPATH, first_path)
    assert first.text == 'Professor'


def test_edit_syllabus():
    driver.get(sample_pages[0])

    driver.find_element(By.CLASS_NAME, 'standard-syllabus').click()

    frame = driver.find_element(By.CLASS_NAME, 'syllabus-iframe')
    driver.switch_to.frame(frame)

    headers = set([ele.text for ele in driver.find_elements(By.CLASS_NAME, 'category-header')])
    assert headers == set(['Course Information', 'Course Policies', 'Grading'])

    first_path = '/html/body/main/div[2]/section[1]/div[2]/div/div[1]/div[2]'
    first_value_path = '/html/body/main/div[2]/section[1]/div[2]/div/div[1]/div[3]'
    first_delete_path = '/html/body/main/div[2]/section[1]/div[2]/div/div[1]/div[1]/button[2]'

    first_text = 'Not Course Title'
    first_value_text = 'Not A Course'

    check_edit(driver, first_path, first_value_path, first_text, first_value_text)
    check_cancel(driver, first_path, first_value_path)

    check_delete(driver, first_path, first_delete_path)
    check_cancel(driver, first_path, first_value_path)

    check_edit(driver, first_path, first_value_path, first_text, first_value_text)
    check_done_edit(driver, first_path, first_value_path, first_text, first_value_text)

    check_delete(driver, first_path, first_delete_path)
    check_done_delete(driver, first_path)
