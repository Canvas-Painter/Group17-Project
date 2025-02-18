from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import atexit
from os.path import join, dirname

extension_path = join(dirname(__file__), '../..')

options = webdriver.ChromeOptions()
options.add_argument(f'--load-extension={extension_path}')
driver = webdriver.Chrome(options=options, service=Service(ChromeDriverManager().install()))

def clean():
    driver.close()

atexit.register(clean)
