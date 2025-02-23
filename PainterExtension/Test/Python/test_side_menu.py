import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestSideMenu(unittest.TestCase):

    def setUp(self):
        # Initialize the Chrome WebDriver (ensure you have chromedriver installed or in PATH).
        self.driver = webdriver.Chrome()
        
        # Replace with the actual path or URL to your test_page.html
        self.driver.get("file:///absolute/path/to/your/project/test_page.html")  
        self.driver.maximize_window()

    def tearDown(self):
        self.driver.quit()

    def test_edit_button(self):
        """
        Verifies that the Edit button toggles the page into 'edit mode'
        and that cancel/done become visible, etc.
        """
        driver = self.driver
        
        # Wait until the Edit button is present
        edit_button = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".edit-mode-btn"))
        )
        
        # Click the Edit button
        edit_button.click()
        
        # Now check if Cancel and Done buttons became visible
        cancel_button = driver.find_element(By.CSS_SELECTOR, ".cancel-btn")
        done_button = driver.find_element(By.CSS_SELECTOR, ".done-btn")
        
        self.assertTrue(cancel_button.is_displayed(), 
                        "Cancel button should be visible after entering edit mode.")
        self.assertTrue(done_button.is_displayed(), 
                        "Done button should be visible after entering edit mode.")
        
        # Optionally, you can check that the "edit-mode" class is applied to <body>
        body = driver.find_element(By.TAG_NAME, "body")
        self.assertIn("edit-mode", body.get_attribute("class"), 
                      "Body should have 'edit-mode' class after clicking Edit.")
        
        # (At this point you could also test if certain fields became editable, etc.)
        # For example, attempt to locate an editable field or confirm "Add Category" is now visible:
        add_category_button = driver.find_element(By.CSS_SELECTOR, ".add-category-btn")
        self.assertTrue(add_category_button.is_displayed(),
                        "Add Category button should be visible in edit mode.")

        # Click Done to exit edit mode
        done_button.click()
        # Short wait to let the UI update
        time.sleep(1)
        
        # Check if we are out of edit mode
        self.assertFalse(cancel_button.is_displayed(), 
                         "Cancel button should not be visible after exiting edit mode.")
        self.assertFalse(done_button.is_displayed(), 
                         "Done button should not be visible after exiting edit mode.")
        self.assertFalse(add_category_button.is_displayed(),
                         "Add Category button should not be visible after exiting edit mode.")
        
        self.assertNotIn("edit-mode", body.get_attribute("class"),
                         "Body should not have 'edit-mode' class after clicking Done.")

    def test_expand_popout(self):
        """
        Verifies that clicking the Expand (pop-out) button from side_menu
        triggers the expected pop-out or new window/element to appear.
        """
        driver = self.driver
        
        # Wait until the side menu or the expand button is present
        expand_button = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".expand-btn"))
        )
        
        # Click the Expand button
        expand_button.click()
        
        # Example check: If the pop-out appears in a new window or a new element becomes visible,
        # wait for that element. You will adapt this to how your code actually pops out the content.
        # Let's suppose a pop-out div with #popout-container is added/shown:
        try:
            popout_element = WebDriverWait(driver, 5).until(
                EC.visibility_of_element_located((By.ID, "popout-container"))
            )
            self.assertTrue(popout_element.is_displayed(), "Pop-out container should be displayed.")
        except:
            self.fail("Pop-out did not appear after clicking the Expand button.")

        # Additional checks can be made here to ensure the correct content is in the pop-out.

if __name__ == "__main__":
    unittest.main()
