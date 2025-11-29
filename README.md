[Codemancer](https://www.codemancer.com/)
=========================================

[![Build Status](https://drone.albertyw.com/api/badges/albertyw/codemancer/status.svg)](https://drone.albertyw.com/albertyw/codemancer)
[![Maintainability](https://qlty.sh/gh/albertyw/projects/codemancer/maintainability.svg)](https://qlty.sh/gh/albertyw/projects/codemancer)
[![Code Coverage](https://qlty.sh/gh/albertyw/projects/codemancer/coverage.svg)](https://qlty.sh/gh/albertyw/projects/codemancer)
[![Varsnap Status](https://www.varsnap.com/project/5760d307-1a12-4bc3-9688-eb5200da81ed/varsnap_badge.svg)](https://www.varsnap.com/project/5760d307-1a12-4bc3-9688-eb5200da81ed/)

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

 - Converted into nginx/docker website
 - Removed use of LocalStorage for configs
 - Removed Notifications based on S3 data
 - Removed geolocation.  It currently only works in San Francisco, but can be modified to use HTML5's
   [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation) instead.
 - Made background color change based on time of day
 - Minor code cleanup, updated javascript libraries, refactored some code.

Background from [dnlzro/horizon](https://github.com/dnlzro/horizon).

Setup and Testing
-----------------

```bash
nvm use 23
npm install
npm test
ln -s .env.development .env
npm start
```
