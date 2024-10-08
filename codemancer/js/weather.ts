import $ from 'jquery';

import getRollbar from './rollbar.js';
import {location} from './location.js';
import { LocationData } from '../../server/location.js';
import { chainAccessor, requestPromise } from './util.js';
import varsnap from './varsnap.js';

const weatherRefreshInterval = 20 * 60 * 1000;
const defaultWeatherData = {'properties': {'periods': [{'shortForecast': 'Error'}]}};
// Icons are from https://erikflowers.github.io/weather-icons/
// Conditions and Descriptors are from observed responses and from
// https://graphical.weather.gov/xml/xml_fields_icon_weather_conditions.php
const weatherConditions = [
  ['Hot', '\uf072'],
  ['Cold', '\uf076'],
  ['Sunny', '\uf00d'],
  ['Clear', '\uf00d'],
  ['Clearing', '\uf00d'],
  ['Cloudy', '\uf013'],
  ['Partly Cloudy', '\uf002'],
  ['Clouds', '\uf013'],
  ['Mostly Cloudy', '\uf041'],
  ['Breezy', '\uf011'],
  ['Windy', '\uf011'],
  ['Blustery', '\uf050'],
  ['Haze', '\uf014'],
  ['Fog', '\uf014'],
  ['Smoke', '\uf062'],
  ['Drizzle', '\uf009'],
  ['Rain Showers', '\uf009'],
  ['Showers', '\uf009'],
  ['Light Rain', '\uf009'],
  ['Rain', '\uf008'],
  ['Heavy Rain', '\uf04e'],
  ['Spray', '\uf04e'],
  ['Dust', '\uf063'],
  ['Sand', '\uf082'],
  ['Smoke', '\uf0c7'],
  ['Showers And Thunderstorms', '\uf00e'],
  ['Thunderstorms', '\uf01e'],
  ['T-storms', '\uf01e'],
  ['Tstms', '\uf01e'],
  ['Rain And Snow Showers', '\uf017'],
  ['Rain And Snow', '\uf017'],
  ['Rain/Sleet', '\uf017'],
  ['Sleet', '\uf017'],
  ['Snow/Sleet', '\uf017'],
  ['Snow Showers', '\uf017'],
  ['Rain/Snow', '\uf017'],
  ['Rain/Freezing', '\uf017'],
  ['Freezing Fog', '\uf076'],
  ['Freezing Spray', '\uf017'],
  ['Freezing Rain', '\uf017'],
  ['Rain/Freezing Rain', '\uf017'],
  ['Freezing Drizzle', '\uf017'],
  ['Freezing', '\uf076'],
  ['Mix', '\uf017'],
  ['Snow', '\uf01b'],
  ['Flurries', '\uf064'],
  ['Blizzard', '\uf064'],
  ['Frost', '\uf076'],
  ['Crystals', '\uf076'],
  ['Ash', '\uf0c8'],
  ['Spouts', '\uf056'],
  ['Error', '\uf04c'],
  ['none', '\uf04c'],
];
const weatherIconConversions = weatherConditions.reduce((map, obj) => {
  map[obj[0]] = obj[1];
  return map;
}, {});
const descriptors = [
  'Volcanic',
  'Severe',
  'Heavy',
  'Very',
  'Dense',
  'Widespread',
  'Mostly',
  'Ice',
  'Wintry',
  'Water',
  'Blowing',
  'Partly',
  'Increasing',
  'Occasional',
  'Becoming',
  'Light',
  'Patchy',
  'Decreasing',
  'Likely',
  'Gradual',
  'Scattered',
  'Areas',
  'Periods Of',
  'Isolated',
  'Late',
  'Chance',
  'Slight',
  'Of',
];
const weatherLookForwardHours = 24;

export const Weather = {

  $el: {
    now : $('.now'),
    city : $('#city')
  },

  // TODO: add varsnap here
  urlBuilder: function urlBuilder(location: LocationData) {
    // Documentation at https://www.weather.gov/documentation/services-web-api#/
    // TODO: send params to backend
    location;

    const url = '/weather';
    return url;
  },

  validate: varsnap(function validate(data) {
    if (!chainAccessor(data, ['properties', 'periods'])) {
      return defaultWeatherData;
    }
    return data;
  }),

  parse: varsnap(function parse(data) {
    // Lets only keep what we need.
    const w2 = {
      currentTemp: 0,
      minTemp: 0,
      maxTemp: 0,
      conditionSequence: [],
      worstCondition: '',
    };
    w2.currentTemp = Math.round(chainAccessor(data, ['properties', 'periods', 0, 'temperature']));
    w2.minTemp = w2.currentTemp;
    w2.maxTemp = w2.currentTemp;
    w2.conditionSequence = [chainAccessor(data, ['properties', 'periods', 0, 'shortForecast'])];
    for (let i = 0; i < weatherLookForwardHours; i++) {
      const periodLength = chainAccessor(data, ['properties', 'periods', 'length']);
      if (!periodLength || i >= periodLength) {
        break;
      }
      const period = data.properties.periods[i];
      const temp = Math.round(chainAccessor(period, ['temperature']));
      w2.minTemp = Math.min(w2.minTemp, temp);
      if (temp < 140) {
        // the API sometimes breaks and returns 140 as a temperature
        w2.maxTemp = Math.max(w2.maxTemp, temp);
      }

      const condition = period.shortForecast;
      if(w2.conditionSequence[w2.conditionSequence.length-1] != condition) {
        w2.conditionSequence.push(condition);
      }
    }
    for (let i=0; i < w2.conditionSequence.length; i++) {
      w2.conditionSequence[i] = Weather.conditionIcon(w2.conditionSequence[i]);
    }
    w2.worstCondition = Weather.worstCondition(w2.conditionSequence);
    return w2;
  }),

  worstCondition: varsnap(function worstCondition(conditionSequence) {
    let worstCondition = conditionSequence[0];
    for (let i=0; i < weatherConditions.length; i++) {
      if(conditionSequence.includes(weatherConditions[i][1])) {
        worstCondition = weatherConditions[i][1];
      }
    }
    return worstCondition;
  }),

  conditionIcon: varsnap(function conditionIcon(condition){
    let weatherIconCode = weatherIconConversions[condition];
    if (weatherIconCode !== undefined) {
      return weatherIconCode;
    }
    for (let i=0; i<descriptors.length; i++) {
      condition = condition.replace(descriptors[i], '');
    }
    condition = condition.replace(/^\s+|\s+$/g, '');
    weatherIconCode = weatherIconConversions[condition];
    if (weatherIconCode !== undefined) {
      return weatherIconCode;
    }
    getRollbar().error('cannot find image for "' + condition + '"');
    return '\uf04c';
  }),

  render: function(wd: Record<string, unknown>): void {
    // Set Current Information
    Weather.renderDay(Weather.$el.now, wd);

    // Show Weather
    $('#weather-inner').removeClass('hidden').show();
  },

  renderDay: function(el, data: Record<string, unknown>): void {
    el.find('.condition').html(data.worstCondition);
    el.find('.min-temp').html(data.minTemp);
    el.find('.current-temp').html(data.currentTemp);
    el.find('.max-temp').html(data.maxTemp);
  },

  load: function(): Promise<void> {
    return location.getLocation()
      .then(Weather.urlBuilder)
      .then((url: string) => {
        return requestPromise(url, 0, 0);
      })
      .then(Weather.validate)
      .then(Weather.parse)
      .then(Weather.render);
  },
};

export function load(): void {
  Weather.load().
    catch(error => { getRollbar().error(error); });
  setInterval(load, weatherRefreshInterval);
}
