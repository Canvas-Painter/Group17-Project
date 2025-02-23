import unittest
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestExtensionPopout(unittest.TestCase):
    """
    Test class to verify that clicking a link/button in the extension's popup
    opens the same page (or another page) in a separate pop-out window.
    """

    def setUp(self):
        """
        Initializes the Chrome driver with the extension loaded.
        """
        # Path to your extension folder
        extension_path = r"/absolute/path/to/my_extension"

        chrome_options = Options()
        # Load the extension; this is crucial for testing it
        chrome_options.add_argument(f"--load-extension={extension_path}")

        # Initialize the WebDriver using the above options
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.maximize_window()

        # In some versions of Chrome or Selenium, you need to wait a bit
        # for the extension to fully load before proceeding.

    def tearDown(self):
        """
        Quits the browser after each test.
        """
        self.driver.quit()

    def test_open_popout_link(self):
        """
        1. Opens the extension's popup page directly via chrome-extension:// URL
           (assuming we know the extension ID or using the first extension window handle).
        2. Clicks on a link in the popup to open it in a new window/tab.
        3. Verifies a new window is created and the correct page is loaded.
        """

        # ------------------------------------------------
        # 1) Find extension ID or open the popup page
        # ------------------------------------------------
        # One approach is to fetch the extension's ID from self.driver.extensions 
        # or navigate to "chrome-extension://<EXTENSION_ID>/popup.html" directly,
        # if you know the extension ID. For demonstration:
        extension_id = "<YOUR_EXTENSION_ID>"  # e.g., "kajdplbg...some random chars..."
        popup_url = f"chrome-extension://{extension_id}/popup.html"

        self.driver.get(popup_url)

        # Wait for the page (popup) to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "darkmode-btn"))
        )

        # ------------------------------------------------
        # 2) Click link/button to open popout
        # ------------------------------------------------
        # Let's assume you have a link with id="open-popout" that opens the page in a new window.
        open_popout_link = self.driver.find_element(By.ID, "open-popout")
        open_popout_link.click()

        # After clicking, a new tab or window should open. Let's capture that.
        # We'll wait briefly for the new window to appear, then get window handles.
        time.sleep(2)  # A short delay for the new window to actually open

        window_handles = self.driver.window_handles
        self.assertTrue(len(window_handles) > 1, "Clicking link should open a new window/tab.")
        
        # The newly opened tab/window will likely be the last handle in the list
        new_window_handle = window_handles[-1]

        # Switch to it
        self.driver.switch_to.window(new_window_handle)

        # ------------------------------------------------
        # 3) Verify the new window is displaying the correct page
        # ------------------------------------------------
        # If the popout is the same popup.html, or if it’s a different URL, check accordingly:
        current_url = self.driver.current_url
        self.assertIn("popup.html", current_url,
                      "Newly opened window/tab should show the popup.html or relevant page.")
        
        # For instance, confirm the same elements appear (like the #darkmode-btn)
        darkmode_btn = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "darkmode-btn"))
        )
        self.assertTrue(darkmode_btn.is_displayed(), "Dark Mode checkbox should be visible.")

        # Optionally, do more checks that the page is truly the correct popout.

if __name__ == "__main__":
    unittest.main()
