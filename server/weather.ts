import { requestPromise } from '../codemancer/js/util.js';

const airnowCacheDuration = 60 * 60 * 1000;
const airnowBackupDuration = 3 * 60 * 60 * 1000;
const weatherCacheDuration = 5 * 60 * 1000;
const weatherBackupDuration = 1 * 60 * 60 * 1000;

export function getAirnowData(latitude: number, longitude: number) {
  // Documentation at https://open-meteo.com/en/docs/air-quality-api
  const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('current', 'us_aqi');
  return requestPromise(url.href, airnowCacheDuration, airnowBackupDuration);
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
