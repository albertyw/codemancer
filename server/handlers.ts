import appRootPath from 'app-root-path';
import webpack from 'webpack';
import middleware from 'webpack-dev-middleware';
import express from 'express';
import path from 'path';

const appRoot = appRootPath.toString();
import dotenv from 'dotenv';
dotenv.config({path: path.join(appRoot, '.env')});
import { Location } from './location.js';
import { getAirnowData, getWeatherData } from './weather.js';
import { getSVGs } from './util.js';
import webpackConfig from '../webpack.config.js';

export function loadTemplateVars(app: express.Express) {
  app.locals.templateVars = {};
  getSVGs().then((svgs) => {
    app.locals.templateVars = {
      LOGFIT_TOKEN: process.env.LOGFIT_TOKEN,
      GITHUB_SVG: svgs.github,
      TOGGLEDEMO_SVG: svgs.toggledemo,
      LOCATION_SVG: svgs.location,
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
  const latitude = parseFloat(req.query.latitude as string);
  const longitude = parseFloat(req.query.longitude as string);
  if (isNaN(latitude) || isNaN(longitude)) {
    res.status(400).json({'error': 'Invalid latitude or longitude'});
    return;
  }
  getAirnowData(latitude, longitude).then(function(data) {
    res.json(data);
  }).catch((error) => {
    res.status(500).json({'error': String(error)});
  });
}

function weatherHandler(req: express.Request, res: express.Response) {
  // Proxy for weather API
  const latitude = parseFloat(req.query.latitude as string);
  const longitude = parseFloat(req.query.longitude as string);
  if (isNaN(latitude) || isNaN(longitude)) {
    res.status(400).json({'error': 'Invalid latitude or longitude'});
    return;
  }
  getWeatherData(latitude, longitude).then(function(data) {
    res.json(data);
  }).catch((error) => {
    res.status(500).json({'error': String(error)});
  });
}

function locationHandler(req: express.Request, res: express.Response) {
  const latitude = parseFloat(req.query.latitude as string);
  const longitude = parseFloat(req.query.longitude as string);
  if (isNaN(latitude) || isNaN(longitude)) {
    res.status(400).json({'error': 'Invalid latitude or longitude'});
    return;
  }
  Location.getLocation(latitude, longitude).then((locationData: any) => {
    res.json(locationData);
  });
}

function webpackMiddleware() {
  const compiler = webpack(webpackConfig());
  if (compiler === null) {
    throw new Error('Failed to create webpack compiler');
  }
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
