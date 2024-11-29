import appRootPath from 'app-root-path';
import webpack from 'webpack';
import middleware from 'webpack-dev-middleware';
import express from 'express';
import path from 'path';

const appRoot = appRootPath.toString();
import dotenv from 'dotenv';
dotenv.config({path: path.join(appRoot, '.env')});
import {Location, targetLocation} from './location.js';
import { requestPromise } from '../codemancer/js/util.js';
import { getSVGs } from './util.js';
import varsnap from '../codemancer/js/varsnap.js';
import webpackConfig from '../webpack.config.js';

const airnowURL = 'https://www.airnowapi.org/aq/forecast/latlong/';
const airnowCacheDuration = 60 * 60 * 1000;
const airnowBackupDuration = 3 * 60 * 60 * 1000;
const weatherCacheDuration = 5 * 60 * 1000;
const weatherBackupDuration = 1 * 60 * 60 * 1000;

export function loadTemplateVars(app: express.Express) {
  app.locals.templateVars = {};
  getSVGs().then((svgs) => {
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
  if (typeof req.query.latitude !== 'string') {
    res.json({'error': 'latitude is not a string'});
    return;
  }
  if (typeof req.query.longitude !== 'string') {
    res.json({'error': 'longitude is not a string'});
    return;
  }
  url.searchParams.append('latitude', req.query.latitude);
  url.searchParams.append('longitude', req.query.longitude);
  url.searchParams.append('API_KEY', process.env.AIRNOW_API_KEY);
  url.searchParams.append('format', 'application/json');
  requestPromise(url.href, airnowCacheDuration, airnowBackupDuration).then(function(data) {
    res.json(data);
  }).catch((error) => {
    res.json({'error': error});
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
  requestPromise(url.href, weatherCacheDuration, weatherBackupDuration).then(function(data) {
    res.json(data);
  }).catch((error) => {
    res.json({'error': error});
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
    publicPath: '/dist/',
  });
}

export function loadHandlers(app: express.Express) {
  app.get('/', generateIndexHandler(app));
  app.get('/airnow/', airnowHandler);
  app.get('/weather/', weatherHandler);
  app.get('/location/', locationHandler);
  app.use('/img', express.static(path.join(appRoot, 'codemancer', 'img')));
  if (process.env.ENV == 'development') {
    app.use(webpackMiddleware());
  } else {
    app.use('/dist', express.static(path.join(appRoot, 'dist')));
  }
  app.use('/privacy.txt', express.static(path.join(appRoot, 'codemancer', 'privacy.txt')));
  app.use('/tos.txt', express.static(path.join(appRoot, 'codemancer', 'tos.txt')));
}
