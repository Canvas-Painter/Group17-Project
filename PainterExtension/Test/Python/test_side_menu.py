import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestSideMenu(unittest.TestCase):
    """
    This test class uses Selenium to verify two main functionalities on a page:
      1) The 'Edit' button toggles the page into and out of an edit mode.
      2) The 'Expand' button triggers a pop-out or expanded panel.
    """

    def setUp(self):
        """
        The setUp method is called before each test.
        - It initializes the Selenium WebDriver and opens our local test page.
        - Make sure you have 'chromedriver' in your PATH or specify its location.
        """
        self.driver = webdriver.Chrome()
        # Replace the path/URL below with the actual path or an HTTP server address 
        # that serves your 'test_page.html'.
        self.driver.get("file:///absolute/path/to/your/project/test_page.html")
        self.driver.maximize_window()

    def tearDown(self):
        """
        The tearDown method is called after each test.
        - It simply quits the browser to ensure each test starts with a fresh session.
        """
        self.driver.quit()

    def test_edit_button(self):
        """
        Verifies that:
        - The 'Edit' button enters an 'edit mode' on the page.
        - The 'Cancel' and 'Done' buttons become visible once in edit mode.
        - Exiting edit mode via 'Done' hides these controls again.
        """
        driver = self.driver
        
        # Wait until the Edit button is present in the DOM
        edit_button = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".edit-mode-btn"))
        )

        # Click the Edit button to toggle into edit mode
        edit_button.click()
        
        # Locate the Cancel and Done buttons, which should appear in edit mode
        cancel_button = driver.find_element(By.CSS_SELECTOR, ".cancel-btn")
        done_button = driver.find_element(By.CSS_SELECTOR, ".done-btn")

        # Check that Cancel and Done are now displayed
        self.assertTrue(cancel_button.is_displayed(), 
                        "Cancel button should be visible after entering edit mode.")
        self.assertTrue(done_button.is_displayed(), 
                        "Done button should be visible after entering edit mode.")
        
        # Optionally, check that the 'edit-mode' class has been applied to <body>
        body = driver.find_element(By.TAG_NAME, "body")
        self.assertIn("edit-mode", body.get_attribute("class"), 
                      "Body should have 'edit-mode' class after clicking Edit.")
        
        # The 'Add Category' button should now be visible in edit mode as well
        add_category_button = driver.find_element(By.CSS_SELECTOR, ".add-category-btn")
        self.assertTrue(add_category_button.is_displayed(),
                        "Add Category button should be visible in edit mode.")

        # Now click 'Done' to exit the edit mode
        done_button.click()

        # Give the page a brief moment to update the UI
        time.sleep(1)
        
        # Validate we're no longer in edit mode:
        # Cancel, Done, Add Category, etc. should be hidden
        self.assertFalse(cancel_button.is_displayed(), 
                         "Cancel button should not be visible after exiting edit mode.")
        self.assertFalse(done_button.is_displayed(), 
                         "Done button should not be visible after exiting edit mode.")
        self.assertFalse(add_category_button.is_displayed(),
                         "Add Category button should not be visible after exiting edit mode.")

        # Also confirm that the 'edit-mode' class is removed from the body
        self.assertNotIn("edit-mode", body.get_attribute("class"),
                         "Body should not have 'edit-mode' class after clicking Done.")

    def test_expand_popout(self):
        """
        Verifies that clicking the 'Expand' button in the side menu 
        (or wherever it's located) triggers a pop-out or expanded panel.
        In this example, we assume the pop-out shows up as an element with ID 'popout-container'.
        """
        driver = self.driver
        
        # Wait for the 'Expand' button (class .expand-btn) to appear
        expand_button = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".expand-btn"))
        )
        
        # Click the Expand button
        expand_button.click()
        
        # If the pop-out appears in a new element, wait for that element to be visible
        # In this example, we assume there's an element with ID 'popout-container'
        try:
            popout_element = WebDriverWait(driver, 5).until(
                EC.visibility_of_element_located((By.ID, "popout-container"))
            )
            # Confirm it's displayed on the page
            self.assertTrue(popout_element.is_displayed(), "Pop-out container should be displayed.")
        except:
            self.fail("Pop-out did not appear after clicking the Expand button.")

        # Additional checks (e.g., verifying text or functionality inside the pop-out) 
        # can be added here.

if __name__ == "__main__":
    unittest.main()
