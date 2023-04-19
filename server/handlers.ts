import appRootPath = require('app-root-path');
import webpack = require('webpack');
import middleware = require('webpack-dev-middleware');
import express = require('express');
import path = require('path');

const appRoot = appRootPath.toString();
import dotenv = require('dotenv');
dotenv.config({path: path.join(appRoot, '.env')});
import {Location, targetLocation} from './location';
import frontendUtil = require('../codemancer/js/util');
import util = require('./util');
import varsnap = require('../codemancer/js/varsnap');
import webpackConfig = require('../webpack.config.js');

const airnowURL = 'https://www.airnowapi.org/aq/forecast/latlong/';
const airnowCacheDuration = 60 * 60 * 1000;
const airnowBackupDuration = 3 * 60 * 60 * 1000;
const weatherCacheDuration = 5 * 60 * 1000;
const weatherBackupDuration = 1 * 60 * 60 * 1000;

export function loadTemplateVars(app: express.Express) {
  app.locals.templateVars = {};
  util.getSVGs().then((svgs) => {
    app.locals.templateVars = {
      LOGFIT_TOKEN: process.env.LOGFIT_TOKEN,
      GITHUB_SVG: svgs.github,
      TOGGLEDEMO_SVG: svgs.toggledemo,
    };
  });
}

function generateIndexHandler(app: express.Express): express.Handler {
  function indexHandler(req: express.Request, res: express.Response) {
    res.render('index', app.locals.templateVars);
  }
  return indexHandler;
}

function airnowHandler(req: express.Request, res: express.Response) {
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
}

function weatherHandler(req: express.Request, res: express.Response) {
  // Proxy for weather API
  // TODO: accept params for weather
  const urlBuilder = varsnap(function urlBuilder(location) {
    // Documentation at https://www.weather.gov/documentation/services-web-api#/
    const url = 'https://api.weather.gov/gridpoints/' + location.wfo + '/'
      + location.x + ',' + location.y + '/forecast/hourly';
    return url;
  }, 'Weather.urlBuilder');
  const url = new URL(urlBuilder(targetLocation));
  frontendUtil.requestPromise(url.href, weatherCacheDuration, weatherBackupDuration).then(function(data) {
    res.json(data);
  });
}

function locationHandler(req: express.Request, res: express.Response) {
  Location.getLocation().then((locationData: any) => {
    res.json(locationData);
  });
}

function webpackMiddleware() {
  // @ts-expect-error Ignore '...' shortcut in webpack.config.js
  const compiler = webpack(webpackConfig());
  return middleware(compiler, {
    publicPath: '/js/',
  });
}

function jsHandler() {
  const staticHandler = express.static(path.join(appRoot, 'codemancer', 'js', 'codemancer.min.js'));
  return staticHandler;
}

function jsMapHandler() {
  const staticHandler = express.static(path.join(appRoot, 'codemancer', 'js', 'codemancer.min.js.map'));
  return staticHandler;
}

export function loadHandlers(app: express.Express) {
  app.get('/', generateIndexHandler(app));
  app.get('/airnow/', airnowHandler);
  app.get('/weather/', weatherHandler);
  app.get('/location/', locationHandler);
  app.use('/css', express.static(path.join(appRoot, 'codemancer', 'css')));
  app.use('/font', express.static(path.join(appRoot, 'codemancer', 'font')));
  app.use('/img', express.static(path.join(appRoot, 'codemancer', 'img')));
  if (process.env.ENV == 'development') {
    app.use(webpackMiddleware());
  } else {
    app.use('/dist', express.static(path.join(appRoot, 'dist')));
    app.use('/js/codemancer.min.js', jsHandler());
    app.use('/js/codemancer.min.js.map', jsMapHandler());
  }
  app.use('/privacy.txt', express.static(path.join(appRoot, 'codemancer', 'privacy.txt')));
  app.use('/tos.txt', express.static(path.join(appRoot, 'codemancer', 'tos.txt')));
}
