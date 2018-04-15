[Codemancer](https://www.codemancer.com/)
=========================================

[ ![Codeship Status for albertyw/codemancer](https://app.codeship.com/projects/fe81e4d0-eb7f-0134-a306-7680d7eb496c/status?branch=master)](https://app.codeship.com/projects/208058)
[![Code Climate](https://codeclimate.com/github/albertyw/codemancer/badges/gpa.svg)](https://codeclimate.com/github/albertyw/codemancer)

Currently extension as a website.

I wanted to show the currently extension on an iPad I had laying around.  Since
chrome extensions only work on desktop chrome, I opted to turn the extension into
a website that could be loaded on any device.  I found a copy of the code on
[Github](https://github.com/vinitkumar/currently) and modified it to work as a website,
stripping away a lot of unneeded code.

Codemancer is currently a stateless static website, served by nginx.

![Screenshot](/codemancer/img/screenshot.png?raw=true "Screenshot")

Changes from Currently Extension
--------------------------------

 - Converted into nginx-backed website
 - Removed use of LocalStorage for configs
 - Removed Notifications based on S3 data
 - Removed geolocation.  It currently only works in San Francisco, but can be modified to use HTML5's
   [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation) instead.
 - Made background color change based on time of day
 - Minor code cleanup, updated javascript libraries, refactored some code.

Setup and Testing
-----------------

```
nvm use 8
npm install
npm test
```
