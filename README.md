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
3. Select "Download Zip" at the bottom of the popup
4. Unzip the downloaded file
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

# Use Cases
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
**Actors:**
1. A student in a class.

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

## other...
User can open the Standarized Syllabus, create a class, write out information, save and close the Standarized Syllabus, then open it again to see the same saved data.
User can edit the Standard Syllabus, and then revert it by selecting "Update" button.

## Continue this project?
**Source Code**

This repository holds all the information related to the development of this project. There are a few branches outside of *main* that were used to develop specific features. You may look through the history to become more informed on how features were made and changed throughout. You can additionally check git blame.

**Issue Tracking**

We have a Trello board [Project TODO Trello](https://trello.com/b/JSf9TgUc/cs-362-pt-team-17-project-painter) where we tracked the our plans for the project. This included plans outside of the software development itself. The "Backlog" includes some of our plans for future development of this project; more ideas are listed in the projects Living Document [Project Living Document](https://docs.google.com/document/d/1Sg_moN46KJ2fcR-Hak0WlZDEZvt-L2gO4nh3mJlo9x4).



## Links
- [Project Living Document](https://docs.google.com/document/d/1Sg_moN46KJ2fcR-Hak0WlZDEZvt-L2gO4nh3mJlo9x4)
- [Developer Documentation](https://docs.google.com/document/d/13YbMxTzsQXYc2uVJYm61ArJ58H_LvJ6tH59HM6h7rzQ)
- [User Documentation](https://docs.google.com/document/d/1xUaHkDol8P2Ght-Y0p4gwRxqx8HyKfweMmLJVI2JGq8)
- [Project Ideas Notion](https://www.notion.so/CS-362-Software-Engineering-2-Project-176bd7e17f8880f7a190db13b8cf9de8)
- [Project TODO Trello](https://trello.com/b/JSf9TgUc/cs-362-pt-team-17-project-painter)
