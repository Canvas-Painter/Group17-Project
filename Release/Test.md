# Testing Guide

## Overview

We currently use two testing frameworks the first is [Jest](https://jestjs.io/) which is used for testing particularly complex bits of code with unit tests on. We also use [Pytest](https://pypi.org/project/pytest/) with [Selenium](https://www.selenium.dev/) to conduct more heavy-duty integration and system tests.

## Running

To run both types of tests you must be in the [PainterExtension](PainterExtension/) directory.

## Jest

To run Jest you must have [npm](https://www.npmjs.com/) (specifically 22) installed and then run:

1. ```npm ci``` to install the dependencies for testing
2. ```npm test``` to run the tests

## Pytest

To run the Pytest tests you must have python3 (specifically 3.10) installed with the corresponding pip and then run:

**Note:** There may bugs installing Chrome on non Ubuntu systems.

**Note:** The Python tests are preferably run on Ubuntu (specifically version 24) because on Linux [PyVirtualDisplay](https://github.com/ponty/PyVirtualDisplay) is used to hide the Chrome window open. To display this you should set the environment variable VISIBLE to something for example ```export VISIBLE=0```.

1. ```pip install -r requirements.txt``` to install the requirements
2. ```pytest``` to run the tests
