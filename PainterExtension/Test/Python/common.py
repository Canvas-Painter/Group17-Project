from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import atexit
# I probably shouldn't be overriding join
from os.path import join, dirname
from os import environ
from sys import platform
# PyVirtualDisplay is linux (and maybe mac) only
if platform == 'linux':
    from pyvirtualdisplay import Display

# Enables the virtual display if needed
display = None
if platform == 'linux' and environ.get('VISIBLE') is None:
    display = Display()
    display.start()

# Gets the root of the extension
extension_path = join(dirname(__file__), '../..')

# Opens chrome with the extension loaded
options = webdriver.ChromeOptions()
options.add_argument(f'--load-extension={extension_path}')
driver = webdriver.Chrome(options=options, service=Service(ChromeDriverManager().install()))

# Closes the window and display
def clean():
    driver.close()

    if display is not None:
        display.stop()

# Hooks up the clean function
atexit.register(clean)
