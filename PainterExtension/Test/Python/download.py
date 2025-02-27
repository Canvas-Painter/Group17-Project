from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import os

# Opens the driver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

while True:
    # Allows the user to navigate to the page they want
    if input('Download?: ') != 'y':
        exit(0)

    # Gets the page and removes the scripts
    html = BeautifulSoup(driver.page_source, 'html.parser')
    for script in html.select('script'):
        script.extract()

    # Saves the page
    save_name = input('Name: ')
    save_path = os.path.join('samples', save_name + '.html')
    with open(save_path, 'w+') as file:
        file.write(str(html))
