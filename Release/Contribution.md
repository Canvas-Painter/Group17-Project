# Contribution Guide

## Overview

**For adding tests please see the [test guide](Test.md)**

This project is a chrome extension written in plain Javascript, CSS, and HTML. Inorder to properly understand this guide and projecet you need to understand how chrome extension function. To learn more please you can do some of the tutorials [here](https://developer.chrome.com/docs/extensions/get-started).

The code for this project is located in the [PainterExtension](PainterExtension/) directory and this project is design to be made up of several almost completly independent projects. Each of these seperate projects is given its own folder such as [Gradebook](PainterExtension/Gradebook). There are other folders as well some are "webpages" hosted by the extension such as [HelpInfo](PainterExtension/HelpInfo) and there are also [icons](PainterExtension/icons) and [addressPopup](PainterExtension/addressPopup) which are shared resources. Icons has the icons for the project and addressPopup handles the popup on click of the chrome extension icon so must be shared.

Given this there are two main ways of contributing.
1. Adding a feature
2. Modifying a feature

## Adding a feature

Adding a feature is really simple you just create a new directory and then put the js and other files for your feature in there. Once you are done you can add them to the manifest for your feature to be included.

## Modifying a feature

To modify a feature you just go into the directory of the feature and modify the files/code you want to change. The features are fairly simple self sufficient blocks of code so reading the code directly will be the quickest way to get up to speed.
