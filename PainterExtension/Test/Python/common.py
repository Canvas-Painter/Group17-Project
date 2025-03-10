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

window_size = (1280, 960)

# Enables the virtual display if needed
display = None
if platform == 'linux' and environ.get('VISIBLE') is None:
    # Add 240 pixels for padding for window decorations
    display = Display(size=(window_size[0] + 240, window_size[1] + 240))
    display.start()

# Gets the root of the extension
extension_path = join(dirname(__file__), '../..')

# The url of the extension
extension_url = 'chrome-extension://ggbhkkiikhcoglfcgliimlmonkdiikhl/'
def generate_url(path):
    return 'file://' + join(extension_path, path)

# Opens chrome with the extension loaded
options = webdriver.ChromeOptions()
options.add_argument(f'--load-extension={extension_path}')
options.add_argument(f'--window-size={window_size[0]},{window_size[1]}')
driver = webdriver.Chrome(options=options, service=Service(ChromeDriverManager().install()))
driver.implicitly_wait(1)

sample_pages = [
    generate_url('Test/Python/samples/grades1.html'),
    generate_url('Test/Python/samples/grades2.html')
]

# Closes the window and display
def clean():
    driver.close()

    if display is not None:
        display.stop()

# Hooks up the clean function
atexit.register(clean)
