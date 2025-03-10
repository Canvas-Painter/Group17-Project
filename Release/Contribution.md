# Contribution Guide

## Overview

**For adding tests please see the [test guide](Test.md)**

This project is a chrome extension written in plain Javascript, CSS, and HTML. In order to properly understand this guide and project you need to understand how chrome extensions function. To learn more please you can do some of the tutorials [here](https://developer.chrome.com/docs/extensions/get-started).

The code for this project is located in the [PainterExtension](../PainterExtension/) directory. This project is designed to be made up of several almost completly independent parts. Each of these seperate parts is given its own folder such as [GradeBook](../PainterExtension/GradeBook). There are other folders as well some are "webpages" hosted by the extension such as [HelpInfo](../PainterExtension/HelpInfo) and there are also [Icons](../PainterExtension/Icons) and [AddressbarPopup](../PainterExtension/AddressbarPopup) which are shared resources. Icons has the icons for the project and addressPopup handles the popup created on click of the chrome extension icon. By their nature these must be shared.

Given this there are two main ways of contributing. Each of these is relatively simple given the decentralized nature of this code (if you know how to write chrome extensions).
1. Adding a feature
2. Modifying a feature

## Adding a feature

Adding a feature is really simple you just create a new directory and then put the js and other files for your feature in there. Once you are done you can add them to the manifest for your feature to be included.

## Modifying a feature

To modify a feature you just go into the directory of the feature and modify the files/code you want to change. The features are fairly simple self sufficient blocks of code so reading the code directly will be the quickest way to get up to speed.
