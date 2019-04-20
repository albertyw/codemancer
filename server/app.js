const browserifyMiddleware = require('browserify-middleware');
const console = require('console');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const mustache = require('mustache');
const path = require('path');
const rfs = require('rotating-file-stream');

require('dotenv').config({path: path.join(__dirname, '..', '.env')});
const Rollbar = require('../codemancer/js/rollbar');
const util = require('./util');

const app = express();

// Set up logging
app.use(morgan('combined'));
const accessLogStream = rfs('access.log', {
  interval: '1d',
  path: path.join(__dirname, '..', 'logs', 'app')
});
app.use(morgan('combined', {stream: accessLogStream }));
app.use(Rollbar.errorHandler());

// Set up mustache
// To set functioning of mustachejs view engine
app.engine('html', function (filePath, options, callback) {
  fs.readFile(filePath, function (err, content) {
    if(err) {
      return callback(err);
    }
    const rendered = mustache.to_html(content.toString(),options);
    return callback(null, rendered);
  });
});
app.set('views', path.join(__dirname, '..', 'codemancer'));
app.set('view engine','html');


function loadTemplateVars() {
  app.locals.templateVars = {};
  util.getSVGs().then((svgs) => {
    app.locals.templateVars = {
      SEGMENT_TOKEN: process.env.SEGMENT_TOKEN,
      LOGFIT_TOKEN: process.env.LOGFIT_TOKEN,
      SUNRISESUNSET_SVG: svgs.sunrisesunset,
      TOGGLEDEMO_SVG: svgs.toggledemo,
      CALENDAR_AUTH_SVG: svgs.calendarAuth,
      CALENDAR_SIGNOUT_SVG: svgs.calendarSignout,
      JAVASCRIPT: util.getJSFileName(),
    };
  });
}
loadTemplateVars();

app.get('/', (req, res) => {
  res.render('index', app.locals.templateVars);
});
app.use('/css', express.static(path.join(__dirname, '..', 'codemancer', 'css')));
app.use('/font', express.static(path.join(__dirname, '..', 'codemancer', 'font')));
app.use('/img', express.static(path.join(__dirname, '..', 'codemancer', 'img')));
if (process.env.ENVIRONMENT == 'development') {
  const browserifyOptions = {
    transform: ['envify']
  };
  const jsFile = path.join(__dirname, '..', 'codemancer', 'js', 'index.js');
  const browserifyHandler = browserifyMiddleware(jsFile, browserifyOptions);
  app.use('/js/' + util.getJSFileName(), browserifyHandler);
} else {
  app.use('/js', express.static(path.join(__dirname, '..', 'codemancer', 'js')));
}

const port = process.env.LISTEN_PORT;
app.listen(port, () => {
  console.log('Listening on port ' + port);
});
