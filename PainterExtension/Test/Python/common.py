from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import atexit

options = webdriver.ChromeOptions()
options.add_argument(f'--load-extension=../..')
driver = webdriver.Chrome(options=options, service=Service(ChromeDriverManager().install()))

def clean():
    driver.close()

atexit.register(clean)
