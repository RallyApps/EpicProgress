Rally Epic Progress
============

![Title](https://raw.github.com/RallyApps/EpicProgress/master/screenshots/title-screenshot.png)

## Overview

The Epic Progress app provides a status view of user stories associated with an epic story for a selected release.

## How to Use

### Running the App

If you want to start using the app immediately, create an Custom HTML app on your Rally dashboard. Then copy App.html from the deploy folder into the HTML text area. That's it, it should be ready to use. See [this](http://www.rallydev.com/help/use_apps#create) help link if you don't know how to create a dashboard page for Custom HTML apps.

Or you can just click [here](https://raw.github.com/RallyApps/EpicProgress/master/deploy/App.html) to find the file and copy it into the custom HTML app.

### Using the App

The resulting view is in a tabular format with the epic stories associated with the selected release shown as row labels. The iterations in the release are shown as vertical swim lanes in which story "cards" are populated according to the iteration they are scheduled in.

Each user story "card" has several visual elements. The top of each card is colored according to the current status of the user story (there is a legend the provides the color/status detail), the story estimate appears at the right hand side of the card, and the bottom of the user story card shows a percentage task complete progress bar. Hovering the the mouse over a user story results in a tooltip that shows the name of the user story.

## Customize this App

<b>NOTE:</b> This app doesn't work using just App-debug.html. You need to copy the deploy file into a Custom HTML Panel in Rally itself.

You're free to customize this app to your liking (see the License section for details). If you need to add any new Javascript or CSS files, make sure to update config.json so it will be included the next time you build the app.

This app uses the Rally SDK 1.32. The documentation can be found [here](http://developer.rallydev.com/help/app-sdk). 

Available Rakefile tasks are:

    rake build                      # Build a deployable app which includes all JavaScript and CSS resources inline
    rake clean                      # Clean all generated output
    rake debug                      # Build a debug version of the app, useful for local development
    rake deploy                     # Deploy an app to a Rally server
    rake deploy:debug               # Deploy a debug app to a Rally server
    rake deploy:info                # Display deploy information
    rake jslint                     # Run jslint on all JavaScript files used by this app, can be enabled by setting ENABLE_JSLINT=true.

## License

EpicProgress is released under the MIT license. See the file [LICENSE](https://raw.github.com/RallyApps/EpicProgress/master/LICENSE) for the full text.