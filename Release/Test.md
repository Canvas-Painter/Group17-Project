# Testing Guide

## Overview

Testing chrome extensions is exceptionally challenging as most of the code relies on the browser enviroment. We currently use two testing frameworks the first is [Jest](https://jestjs.io/) which is used for testing particularly complex bits of code with unit tests on. We also use [Pytest](https://pypi.org/project/pytest/) with [Selenium](https://www.selenium.dev/) to conduct more heavy-duty integration and system tests. Given how much of the code relies on the browser, Pytest is where most of the testing is done.

## Running

To run both types of tests you must be in the [PainterExtension](../PainterExtension) directory.

### Jest

To run Jest you must have [npm](https://www.npmjs.com/) (specifically 22) installed and then run:

1. ```npm ci``` to install the dependencies for testing
2. ```npm test``` to run the tests

### Pytest

To run the Pytest tests you must have python3 (specifically 3.10) installed with the corresponding pip and then run:

**Note:** There may bugs installing Chrome on non Ubuntu systems.

**Note:** The Python tests are preferably run on Ubuntu (specifically version 24) because on Linux [PyVirtualDisplay](https://github.com/ponty/PyVirtualDisplay) is used to hide the Chrome window open. To run with the display you should set the environment variable VISIBLE to something for example ```export VISIBLE=0```.

1. ```pip install -r requirements.txt``` to install the requirements
2. ```pytest``` to run the tests

## Adding

### Jest

**Note:** Jest tests do not use any browser functionality.

To add a Jest test you must go into the [Javascript](../PainterExtension/Test/Javascript) directory and create a new file ```testname.test.js```. In the file you can import your desired libraries. To import chrome extension code you you must use a trick to get the code to run, because of JS compatibility. To *import* a file use the line ```eval(imp.test_import('path/to/code'))``` this will run the chrome extension code directly and then you can test it. To create a Jest test please see there [docs](https://jestjs.io/docs/getting-started).

### Python

To create a Pytest you must go into the directory [Python](../PainterExtension/Test/Python) and create a file ```test_testname.py```. In the file to interact with the browser and extension you should use the common library. Common has several useful values and functions.

1. ```driver``` is a global variable that holds the selenium driver as it is global your test must initialize everything.
2. ```generate_url``` is a function that will generate a url to any file in [PainterExtension](../PainterExtension) given the path to it. This lets you load sample pages.
3. ```extension_url``` is the url of the extension so allows you to open up extension webpages by joining their path to it.

To create a Pytest test please see their [docs](https://docs.pytest.org/en/stable/) and to use Selenium you can visit their docs [here](https://www.selenium.dev/documentation/).
