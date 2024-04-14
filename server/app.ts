import appRootPath = require('app-root-path');
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
import getRollbar = require('../codemancer/js/rollbar');
import handlers = require('./handlers');

const app = express();

// Set up logging
function setupLogging(app: express.Express) {
  morgan.token('remote-addr', function (req) {
    const ip = req.headersDistinct['x-real-ip'];
    if (ip === undefined) {
      return '127.0.0.1';
    }
    return ip[0];
  });
  app.use(morgan('combined'));
  const accessLogStream = rfs.createStream('access.log', {
    interval: '7d',
    path: path.join(appRoot, 'logs', 'app'),
    compress: true,
  });
  app.use(morgan('combined', {stream: accessLogStream }));
  app.use(getRollbar().errorHandler());
}
setupLogging(app);

// Set up mustache
// To set functioning of mustachejs view engine
function setupMustache(app: express.Express) {
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
}
setupMustache(app);

handlers.loadTemplateVars(app);
handlers.loadHandlers(app);

const port = 3000;
app.listen(port, () => {
  console.log('Listening on port ' + port.toString());
});
