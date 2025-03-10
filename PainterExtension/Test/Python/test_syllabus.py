from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

from common import driver, sample_pages

# Gets the first child of an element
def get_child(ele):
    return ele.find_element(By.XPATH, './*')


# Edits the html replacing the first entry with first_text and first_value_text
def check_edit(driver, first_path, first_value_path, first_text, first_value_text):
    # Goes into edit mode
    driver.find_element(By.CLASS_NAME, 'edit-mode-btn').click()

    # Replace the key
    first = driver.find_element(By.XPATH, first_path)
    first.click()
    child = get_child(first)
    child.send_keys(Keys.CONTROL + 'a' + Keys.DELETE)
    child.send_keys(first_text + Keys.ENTER)

    # Replace the value
    firstValue = driver.find_element(By.XPATH, first_value_path)
    firstValue.click()
    get_child(firstValue).send_keys(first_value_text + Keys.ENTER)

    # Check they were changed
    first = driver.find_element(By.XPATH, first_path)
    assert first.text == first_text
    firstValue = driver.find_element(By.XPATH, first_value_path)
    assert firstValue.text == first_value_text


# Checks that cancel restored the html to the start state
def check_cancel(driver, first_path, first_value_path):
    # Cancels edit mode
    driver.find_element(By.CLASS_NAME, 'cancel-btn').click()

    # Checks the values are at the same at the start
    first = driver.find_element(By.XPATH, first_path)
    assert first.text == 'Course Title'
    firstValue = driver.find_element(By.XPATH, first_value_path)
    assert firstValue.text == ''


# Clicks the first delete button and checks the next item is correct
def check_delete(driver, first_path, first_delete_path):
    # Goes into edit mode
    driver.find_element(By.CLASS_NAME, 'edit-mode-btn').click()

    # Clicks delete
    driver.find_element(By.XPATH, first_delete_path).click()

    # Checks the delete was successful
    first = driver.find_element(By.XPATH, first_path)
    assert first.text == 'Professor'


# Checks that an edit has successfully completed
def check_done_edit(driver, first_path, first_value_path, first_text, first_value_text):
    # Clicks the done button to confirm
    driver.find_element(By.CLASS_NAME, 'done-btn').click()

    # Checks the first element key is changed
    first = driver.find_element(By.XPATH, first_path)
    assert first.text == first_text

    # Checks the first element value is changed
    first = driver.find_element(By.XPATH, first_value_path)
    assert first.text == first_value_text


# Checks that a delete edit was successful
def check_done_delete(driver, first_path):
    # Clicks the done button
    driver.find_element(By.CLASS_NAME, 'done-btn').click()

    # Checks that the entry was deleted
    first = driver.find_element(By.XPATH, first_path)
    assert first.text == 'Professor'


def test_edit_syllabus():
    # Loads page
    driver.get(sample_pages[0])

    driver.find_element(By.CLASS_NAME, 'standard-syllabus').click()

    # Switches to the iframe that actually does the work
    frame = driver.find_element(By.CLASS_NAME, 'syllabus-iframe')
    driver.switch_to.frame(frame)

    # Checks that headers were loaded right
    headers = set([ele.text for ele in driver.find_elements(By.CLASS_NAME, 'category-header')])
    assert headers == set(['Course Information', 'Course Policies', 'Grading'])

    # Loads the paths that are going to be checked
    first_path = '/html/body/main/div[2]/section[1]/div[2]/div/div[1]/div[2]'
    first_value_path = '/html/body/main/div[2]/section[1]/div[2]/div/div[1]/div[3]'
    first_delete_path = '/html/body/main/div[2]/section[1]/div[2]/div/div[1]/div[1]/button[2]'

    # Sample texts to be inputted
    first_text = 'Not Course Title'
    first_value_text = 'Not A Course'

    # Checks an edit then cancel
    check_edit(driver, first_path, first_value_path, first_text, first_value_text)
    check_cancel(driver, first_path, first_value_path)

    # Checks a delete then cancel
    check_delete(driver, first_path, first_delete_path)
    check_cancel(driver, first_path, first_value_path)

    # Checks an edit and confirm
    check_edit(driver, first_path, first_value_path, first_text, first_value_text)
    check_done_edit(driver, first_path, first_value_path, first_text, first_value_text)

    # Checks a delete and confirm
    check_delete(driver, first_path, first_delete_path)
    check_done_delete(driver, first_path)
