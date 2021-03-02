import appRootPath = require('app-root-path');
import browserifyMiddleware = require('browserify-middleware');
import console = require('console');
import express = require('express');
import fs = require('fs');
import morgan = require('morgan');
import mustache = require('mustache');
import path = require('path');
import rfs = require('rotating-file-stream');

const appRoot = appRootPath.toString();
import dotenv = require('dotenv');
dotenv.config({path: path.join(appRoot, '.env')});
import frontendUtil = require('../codemancer/js/util');
import Rollbar = require('../codemancer/js/rollbar');
import util = require('./util');

const airnowURL = 'https://www.airnowapi.org/aq/forecast/latlong/';
const airnowCacheDuration = 60 * 60 * 1000;
const airnowBackupDuration = 3 * 60 * 60 * 1000;

const app = express();

// Set up logging
app.use(morgan('combined'));
const accessLogStream = rfs.createStream('access.log', {
  interval: '7d',
  path: path.join(appRoot, 'logs', 'app')
});
app.use(morgan('combined', {stream: accessLogStream }));
app.use(Rollbar.errorHandler());

// Set up mustache
// To set functioning of mustachejs view engine
app.engine('html', function (filePath, options, callback) {
  fs.readFile(filePath, function (err, content) {
    if(err) {
      return callback(err, '');
    }
    const rendered = mustache.render(content.toString(), options);
    return callback(null, rendered);
  });
});
app.set('views', path.join(appRoot, 'codemancer'));
app.set('view engine','html');


function loadTemplateVars() {
  app.locals.templateVars = {};
  util.getSVGs().then((svgs) => {
    app.locals.templateVars = {
      SEGMENT_TOKEN: process.env.SEGMENT_TOKEN,
      LOGFIT_TOKEN: process.env.LOGFIT_TOKEN,
      GITHUB_SVG: svgs.github,
      SUNRISESUNSET_SVG: svgs.sunrisesunset,
      TOGGLEDEMO_SVG: svgs.toggledemo,
      CALENDAR_AUTH_SVG: svgs.calendarAuth,
      CALENDAR_SIGNOUT_SVG: svgs.calendarSignout,
    };
  });
}
loadTemplateVars();

app.get('/', (req, res) => {
  res.render('index', app.locals.templateVars);
});
app.get('/airnow/', (req, res) => {
  // Proxy for Airnow because their API doesn't support CORS
  const url = new URL(airnowURL);
  if (
    typeof req.query.latitude !== 'string' ||
    typeof req.query.longitude !== 'string'
  ) {
    return res.json({'error': 'latitude is not a string'});
  }
  url.searchParams.append('latitude', req.query.latitude);
  url.searchParams.append('longitude', req.query.longitude);
  url.searchParams.append('API_KEY', process.env.AIRNOW_API_KEY);
  url.searchParams.append('format', 'application/json');
  frontendUtil.requestPromise(url.href, airnowCacheDuration, airnowBackupDuration).then(function(data) {
    res.json(data);
  });
});
app.use('/css', express.static(path.join(appRoot, 'codemancer', 'css')));
app.use('/font', express.static(path.join(appRoot, 'codemancer', 'font')));
app.use('/img', express.static(path.join(appRoot, 'codemancer', 'img')));
if (process.env.ENV == 'development') {
  const browserifyOptions = {
    plugin: ['tsify'],
    transform: ['envify'],
  };
  const jsFile = path.join(appRoot, 'codemancer', 'js', 'index.ts');
  const browserifyHandler = browserifyMiddleware(jsFile, browserifyOptions);
  app.use('/js/codemancer.min.js', browserifyHandler);
} else {
  app.use('/js', express.static(path.join(appRoot, 'codemancer', 'js')));
}

const port = process.env.LISTEN_PORT;
app.listen(port, () => {
  console.log('Listening on port ' + port);
});
