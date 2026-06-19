import appRootPath from 'app-root-path';
import path from 'path';
const appRoot = appRootPath.toString();
import dotenv from 'dotenv';
dotenv.config({path: path.join(appRoot, '.env')});

import { requestPromise } from '../codemancer/js/util.js';

const airnowURL = 'https://www.airnowapi.org/aq/forecast/latlong/';
const airnowCacheDuration = 60 * 60 * 1000;
const airnowBackupDuration = 3 * 60 * 60 * 1000;
const weatherCacheDuration = 5 * 60 * 1000;
const weatherBackupDuration = 1 * 60 * 60 * 1000;

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
  // Documentation at https://open-meteo.com/en/docs
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('current', 'temperature_2m,weathercode');
  url.searchParams.set('hourly', 'temperature_2m,weathercode');
  url.searchParams.set('temperature_unit', 'fahrenheit');
  url.searchParams.set('forecast_days', '2');
  // Return timestamps in the location's local time instead of UTC.
  url.searchParams.set('timezone', 'auto');
  return requestPromise(url.href, weatherCacheDuration, weatherBackupDuration);
}
