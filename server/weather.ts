import appRootPath from 'app-root-path';
import path from 'path';
const appRoot = appRootPath.toString();
import dotenv from 'dotenv';
dotenv.config({path: path.join(appRoot, '.env')});

import { requestPromise } from '../codemancer/js/util.js';
import varsnap from '../codemancer/js/varsnap.js';

const airnowURL = 'https://www.airnowapi.org/aq/forecast/latlong/';
const airnowCacheDuration = 60 * 60 * 1000;
const airnowBackupDuration = 3 * 60 * 60 * 1000;
const weatherCacheDuration = 5 * 60 * 1000;
const weatherBackupDuration = 1 * 60 * 60 * 1000;

interface WeatherPointsResponse {
  properties: {
    gridId: string,
    gridX: number,
    gridY: number,
  },
}

export interface AirnowResponse {
  DateIssue: string,
  DateForecast: string,
  ReportingArea: string,
  StateCode: string,
  Latitude: number,
  Longitude: number,
  ParameterName: string,
  AQI: number,
  Category: {
    Number: number,
    Name: string,
  },
  ActionDay: boolean,
}

export function getAirnowData(latitude: number, longitude: number) {
  // See test/data for example response
  const airnowKey = process.env.AIRNOW_API_KEY || '';
  const url = new URL(airnowURL);
  url.searchParams.append('latitude', String(latitude));
  url.searchParams.append('longitude', String(longitude));
  url.searchParams.append('API_KEY', airnowKey);
  url.searchParams.append('format', 'application/json');
  const request = <Promise<AirnowResponse[]>>requestPromise(url.href, airnowCacheDuration, airnowBackupDuration);
  return request;
}

export function getWeatherData(latitude: number, longitude: number) {
  const pointsURLBuilder = varsnap(function pointsURLBuilder(latitude, longitude) {
    // Documentation at https://www.weather.gov/documentation/services-web-api#/
    // https://api.weather.gov/points/37.78,-122.41
    const url = 'https://api.weather.gov/points/' + latitude + ',' + longitude;
    return url;
  }, 'Weather.pointsURLBuilder');
  const pointsURL = new URL(pointsURLBuilder(latitude, longitude));
  const request = <Promise<WeatherPointsResponse>>requestPromise(pointsURL.href, weatherCacheDuration, weatherBackupDuration);
  return request.then(function(data: WeatherPointsResponse) {
    if (data.properties === undefined || data.properties === null) {
      throw new Error('Invalid response from weather.gov: ' + JSON.stringify(data));
    }
    return {
      gridId: data.properties.gridId,
      gridX: data.properties.gridX,
      gridY: data.properties.gridY,
    };
  }).then(function(location) {
    const urlBuilder = varsnap(function urlBuilder(location) {
      // Documentation at https://www.weather.gov/documentation/services-web-api#/
      // https://api.weather.gov/gridpoints/MTR/85,105/forecast/hourly
      const url = 'https://api.weather.gov/gridpoints/' + location.gridId + '/'
        + location.gridX + ',' + location.gridY + '/forecast/hourly';
      return url;
    }, 'Weather.urlBuilder');
    const url = new URL(urlBuilder(location));
    return requestPromise(url.href, weatherCacheDuration, weatherBackupDuration);
  });
}
