const $ = require('jquery');

const Rollbar = require('./rollbar');
const Location = require('./location');
const Storage = require('./storage');
const util = require('./util');
const varsnap = require('./varsnap');

const weatherRefreshInterval = 20 * 60 * 1000;
// Icons are from https://erikflowers.github.io/weather-icons/
// Conditions are from https://graphical.weather.gov/xml/xml_fields_icon_weather_conditions.php
const weatherConditions = [
  ['Sunny', '\uf00d'],
  ['Clear', '\uf00d'],
  ['Cloudy', '\uf013'],
  ['Partly Cloudy', '\uf002'],
  ['Mostly Cloudy', '\uf041'],
  ['Areas Of Fog', '\uf014'],
  ['Fog', '\uf014'],
  ['Smoke', '\uf062'],
  ['Drizzle', '\uf009'],
  ['Rain Showers', '\uf009'],
  ['Light Rain', '\uf009'],
  ['Rain', '\uf008'],
  ['Heavy Rain', '\uf04e'],
  ['Showers And Thunderstorms', '\uf00e'],
  ['T-storms', '\uf01e'],
];
const weatherIconConversions = new Map(weatherConditions);
const descriptors = [
  'Mostly',
  'Partly',
  'Slight Chance',
  'Chance',
  'Likely',
  'Isolated',
  'Scattered',
  'Periods Of',
  'Patchy',
  'Occasional',
  'Very',
];
const weatherLookForwardHours = 24;

const Weather = {

  $el: {
    now : $('.now'),
    city : $('#city')
  },

  urlBuilder: varsnap(function urlBuilder(location) {
    // Documentation at https://www.weather.gov/documentation/services-web-api#/
    const url = 'https://api.weather.gov/gridpoints/' + location.wfo + '/'
      + location.x + ',' + location.y + '/forecast/hourly';
    return url;
  }),

  atLocation: function () {
    const getWeather = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', Weather.urlBuilder(Location.targetLocation));
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => {
        const error = 'Cannot get weather';
        const weatherData = Storage.getWeatherData();
        if (weatherData !== null) {
          Rollbar.error(error, xhr.statusText);
          return resolve(weatherData);
        }
        return reject(error, xhr.statusText);
      };
      reject([new Error('Cannot get weather'), xhr.statusText]);
      xhr.send();
    });
    const getDisplayName = Location.getDisplayName(Location.targetLocation);
    return Promise.all([getWeather, getDisplayName]).
      then((values) => {
        const data = JSON.parse(values[0]);
        data.locationDisplayName = values[1];
        return data;
      }).
      then(Weather.validate).
      then(Weather.parse);
  },

  validate: varsnap(function validate(data) {
    if (!util.chainAccessor(data, ['properties', 'periods'])) {
      Rollbar.error('No weather forecast periods available', data);
      return Storage.getWeatherData();
    }
    Storage.setWeatherData(data);
    return data;
  }),

  parse: varsnap(function parse(data) {
    // Lets only keep what we need.
    const w2 = {};
    w2.city = data.locationDisplayName;
    w2.currentTemp = Math.round(util.chainAccessor(data, ['properties', 'periods', 0, 'temperature']));
    w2.minTemp = w2.currentTemp;
    w2.maxTemp = w2.currentTemp;
    w2.conditionSequence = [util.chainAccessor(data, ['properties', 'periods', 0, 'shortForecast'])];
    for (let i = 0; i < weatherLookForwardHours; i++) {
      if (i >= data.properties.periods.length) {
        break;
      }
      const period = data.properties.periods[i];
      const temp = Math.round(util.chainAccessor(period, ['temperature']));
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
    let weatherIconCode = weatherIconConversions.get(condition);
    if (weatherIconCode !== undefined) {
      return weatherIconCode;
    }
    for (let i=0; i<descriptors.length; i++) {
      condition = condition.replace(descriptors[i], '');
    }
    condition = condition.replace(/^\s+|\s+$/g, '');
    weatherIconCode = weatherIconConversions.get(condition);
    if (weatherIconCode !== undefined) {
      return weatherIconCode;
    }
    Rollbar.error('cannot find image for "' + condition + '"');
    return '\uf04c';
  }),

  render: function(wd) {
    // Set Current Information
    Weather.renderDay(Weather.$el.now, wd);
    Weather.$el.city.html(wd.city).show();

    // Show Weather
    $('#weather-inner').removeClass('hidden').show();
  },

  renderDay: function(el, data) {
    el.find('.condition').html(data.worstCondition);
    el.find('.min-temp').html(data.minTemp);
    el.find('.current-temp').html(data.currentTemp);
    el.find('.max-temp').html(data.maxTemp);
  },

  load: function() {
    return Weather.atLocation();
  }
};

function main() {
  Weather.load().then(function(data) {
    Weather.render(data);
  }, function(error) {
    Rollbar.error(error);
  });
  setInterval(main, weatherRefreshInterval);
}

module.exports = {
  load: main,
  Weather: Weather,
};
