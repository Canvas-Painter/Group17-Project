# Project Painter
In modern educational environments, Canvas has become a mainstay in both higher and lower educations. While Canvas offers a robust learning platform, its interface and other functionalities are severely lacking. These shortcomings fail to meet the needs of both students and instructors alike. It only further exacerbates the communication gap between students and instructors. This project aims to develop a Google Chrome extension that will better the user experience and attempt to fill many of Canvas’s shortcomings. This project will improve upon canvas productivity, accessibility, and engagement with its growing student and instructor population. Building an entirely new system for students to interact with would be impractical for students, as the transition from one interface to another requires time and commitment to learning a system when most students are already stretched on time. This extension would aim to solve many of the shortcomings of canvas while not changing the primary interface. It is suitable to fix many issues with a simple upgrade package marketed to simplify students' experiences to allow for greater efficiency. This extension aims to reduce the efficiency problems with Canvas as a learning platform without sacrificing the familiarity it has gained with students and instructors.

# Repository Layout:
1. /reports : Weekly reports, YYYYMMDD.md
2. /PainterExtension: Chrome Extension, features in sub-directories
3. /PainterExtensionSupplementary: Software that supports the Painter extension, but is not part of the extension.
4. /documents: The location of project documents including Project Proposal, Developer Documentation and User Documentation
5. /reports: The location of weekly reports written throughout its development
6. /uml: The location of systems and architecture diagrams for the project
7. /beta-testing: The location of the feedback received from our in-class beta test

# HOW TO INSTALL & RUN:
# Installation
1. Navigate to the the main page of the Repository (https://github.com/Canvas-Painter/Group17-Project)
2. Select the green button labeled "Code"
3. Select "Download Zip" at the bottom of the popup and unzip the folder, or copy the repository url locally [GitHub documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)
# Setup
1. Open a chrome browser (can download here if not already installed: https://www.google.com/chrome/)
2. In the search bar, enter "chrome://extensions", or right click the **puzzle piece** to the right of the search bar and select “Manage Extensions”
3. In the top right of the page, ensure that “Developer mode” is turned on (slider button)
4. In the top left of the page, select "Load unpacked"
5. Navigate to the location of the downloaded file
6. Single-click the "PainterExtension" folder (so it is highlighted), then click "Select Folder"
7. “Canvas Painter” should be visible in your list of “All Extensions” – ensure that it has also been selected (slider button)
8. The extension is now active and can be pinned by clicking the **puzzle piece** again, then clicking the **tac** next to “Canvas Painter” in the menu that pops up
9. Relevant information on how to use the extension can be found by clicking the “Canvas Painter” icon when pinned, and clicking the “Help” button

# Report Bugs?
If you find an issue/error with the project code, you can simply create a [git issue](https://github.com/Canvas-Painter/Group17-Project/issues). Please leave a descriptive comment that explains what steps should be taken for the error to occur. Images where applicable can also be helpful.

# Use Cases:
## Make Canvas Look Better
- Actors: Students and instructors who prefer a customized theme for improved accessibility or visual comfort.
- Triggers: A student or instructor finds the default Canvas interface visually uncomfortable.

**Preconditions:** 
1. The Chrome extension is installed and active.
2. The user is logged into Canvas.

**Postconditions (success scenario):**
- The user applies a customized theme (e.g., dark mode) that persists across sessions.

**List of steps (success scenario):**
1. The user logs into Canvas using the Chrome browser with the extension installed.
2. The user opens the extension’s settings menu.
3. The user selects a predefined theme (e.g., dark mode) or customizes colors manually.
4. The extension dynamically updates Canvas pages with the selected theme.
5. The theme settings are saved locally and persist across user sessions.

**Extensions/variations of the success scenario:**
1. The extension provides darkmode default theme.
2. The extension allows users to create, save, and edit their own themes.
3. The theme persists through tabs/browser tab sessions

**Exceptions (failure conditions and scenarios):**
1. The user selects a theme that causes readability issues > Can turn off the theme and edit colors or delete the theme
2. Changes to Canvas's DOM break theme application > The extension reverts to default or provides a warning.

## Check Grade Needed
**Actor:** A student in a class.

**Triggers:**
The student wants to see what grade they need on an assignment to achieve a grade.

**Preconditions:**
1. The student has an assignment and grade they want to check for a grade in class.

**Postconditions (success scenario):**
1. The user is displayed the grade they need.

**List of steps (success scenario):**
1. The user inputs the grade they desire.
2. The user inputs the category and points.
3. Then the program uses math to compute the results.
4. Then the program displays the results.

**Extensions/variations of the success scenario:**
1. None

**Exceptions (failure conditions and scenarios):**
1. The student inputs an invalid grade in which case the program will give an output telling them that and telling what the math gives even with the strange inputs.

## Check TA Times
**Actor:** A student in a class.

**Triggers:**
Student needs help with completing their weekly assignment

**Preconditions:**
1. Student is “Logged-in” to their school-related Canvas account
2. Student is on the “Dashboard”
3. Student has already filled in their TA times for the class in the table provided by the extension

**Postconditions (success scenario):**
1. Student sees a table of TA hours for Monday-Friday of their desired class

**List of steps (success scenario):**
1. Student “scrolls down” their Canvas Dashboard
2. Student views the “TA Times Table”
3. Student is able to see the TA times related to the class they're searching for

**Extensions/variations of the success scenario:**
1. Student does not need to “scroll down”
2. Student sees TA times of other classes too

**Exceptions (failure conditions and scenarios):**
1. Student has no classes on their Canvas page (table is "empty)
2. Classes on their Canvas page don’t specify TA times (table is "empty)

## Check Syllabus Information
**Actor:** A student in a class.

**Triggers:**
A student who wants to quickly check information about their class

**Preconditions:**
1. The Chrome extension is installed and active.
2. The user is logged into Canvas.

**Postconditions (success scenario):**
1. User sees standardized information of Instructor and TA contact information and office hours and grading policies all in a table for easy reading

**List of steps (success scenario):**
1. The user goes to [](https://canvas.oregonstate.edu/) to access their dashboard
2. The user selects a class with support for the standardized syllabus
3. The user selects the “Standard Syllabus” link on the middle-left sidebar

**Extensions/variations of the success scenario:**
1. The extension could have user entered information on the “Standard Syllabus” page or it could have data synced with an online database.

**Exceptions (failure conditions and scenarios):**
1. The link does nothing and no table is accessible
2. There is no link
3. There is no data filled for the class, so no information is visible

## Engaging Canvas Calendar Experience
**Actor:** A student trying to keep track of what they need to do and trying to find motivation to complete it.

**Triggers:**
A student who wants to see a neat and engaging to-do list with incentives to complete tasks. 

**Preconditions:**
1. The Chrome extension is installed and working correctly.
2. The user is logged into canvas and is either on the home page or the calendar 

**Postconditions (success scenario):**
1. The user sees a list of tasks to do as well as an associated points system and rewards for completing assignments early. A colorful and engaging screen greets them with a number of custom options for decoration.

**List of steps (success scenario):**
1. The user logs into canvas
2. Accesses the calendar feature to see the gamify section.

**Extensions/variations of the success scenario:**
N/A

**Exceptions (failure conditions and scenarios):**
1. The canvas extension is working incorrectly or is not properly installed or syncing with Canvas LMS.

## Links:
- [Project Living Document](https://docs.google.com/document/d/1Sg_moN46KJ2fcR-Hak0WlZDEZvt-L2gO4nh3mJlo9x4)
- [Developer Documentation](https://docs.google.com/document/d/13YbMxTzsQXYc2uVJYm61ArJ58H_LvJ6tH59HM6h7rzQ)
- [User Documentation](https://docs.google.com/document/d/1xUaHkDol8P2Ght-Y0p4gwRxqx8HyKfweMmLJVI2JGq8)
- [Project Ideas Notion](https://www.notion.so/CS-362-Software-Engineering-2-Project-176bd7e17f8880f7a190db13b8cf9de8)
- [Project TODO Trello](https://trello.com/b/JSf9TgUc/cs-362-pt-team-17-project-painter)
